import { useCallback, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// AssemblyAI Streaming v3 butuh PCM16 mono 16kHz, bukan webm/opus.
// Karena itu kita pakai Web Audio API (AudioContext + ScriptProcessorNode)
// untuk mengambil sample mentah, lalu convert ke Int16 sebelum dikirim.
//
// CATATAN MIGRASI (Sep 2026): sebelumnya hook ini memakai AssemblyAI
// Streaming v2 (wss://api.assemblyai.com/v2/realtime/ws), yang resmi
// dimatikan AssemblyAI per 31 Jan 2026. Itulah penyebab pesan
// "Terjadi masalah dengan koneksi audio/transkripsi" yang selalu muncul.
// Hook ini sekarang memakai Streaming v3 (wss://streaming.assemblyai.com/v3/ws),
// yang juga beda cara kirim audio (binary mentah, bukan JSON+base64) dan
// beda format pesan transkrip (satu tipe "Turn" dengan flag end_of_turn,
// bukan PartialTranscript/FinalTranscript terpisah seperti v2).

const TARGET_SAMPLE_RATE = 16000;

function floatTo16BitPCM(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

function downsampleBuffer(buffer, inputSampleRate, targetSampleRate) {
  if (targetSampleRate === inputSampleRate) return buffer;
  const ratio = inputSampleRate / targetSampleRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = accum / (count || 1);
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

export function useLiveTranscription({ onFinalTranscript, onPartialTranscript, onError }) {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | connecting | listening | error

  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);

  const stop = useCallback(() => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    audioContextRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'Terminate' }));
      socketRef.current.close();
    }

    processorRef.current = null;
    sourceRef.current = null;
    audioContextRef.current = null;
    streamRef.current = null;
    socketRef.current = null;

    setIsRecording(false);
    setStatus('idle');
  }, []);

  const start = useCallback(async () => {
    try {
      setStatus('connecting');

      // 1. Ambil token sementara dari Supabase Edge Function (bukan API key langsung)
      const { data, error } = await supabase.functions.invoke('generate-token');
      if (error || !data?.token) {
        throw new Error(error?.message || data?.error || 'Gagal mengambil token AssemblyAI');
      }

      // 2. Buka koneksi mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // ScriptProcessorNode sudah deprecated tapi masih paling kompatibel lintas browser.
      // Untuk produksi, pertimbangkan migrasi ke AudioWorkletNode.
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // 3. Buka WebSocket ke AssemblyAI Streaming v3.
      //    speech_model=universal-streaming-multilingual dipilih supaya satu
      //    koneksi jalan baik untuk sesi Bahasa Indonesia maupun Inggris
      //    (toggle ID/EN di UI cuma mengganti bahasa prompt AI, bukan model STT).
      const params = new URLSearchParams({
        sample_rate: String(TARGET_SAMPLE_RATE),
        encoding: 'pcm_s16le',
        format_turns: 'true',
        speech_model: 'universal-streaming-multilingual',
        token: data.token,
      });
      const socket = new WebSocket(`wss://streaming.assemblyai.com/v3/ws?${params.toString()}`);
      socketRef.current = socket;

      socket.onopen = () => {
        // Status "listening" beneran dipasang setelah pesan "Begin" dari server
        // (lihat onmessage) supaya nggak keburu ijo padahal sesi belum resmi jalan.
        processor.onaudioprocess = (event) => {
          const inputData = event.inputBuffer.getChannelData(0);
          const downsampled = downsampleBuffer(inputData, audioContext.sampleRate, TARGET_SAMPLE_RATE);
          const pcm16 = floatTo16BitPCM(downsampled);

          // v3 menerima audio sebagai binary WebSocket frame mentah,
          // BUKAN dibungkus JSON + base64 seperti v2.
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(pcm16);
          }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
      };

      socket.onmessage = (message) => {
        const res = JSON.parse(message.data);

        if (res.type === 'Begin') {
          setStatus('listening');
          setIsRecording(true);
        }

        if (res.type === 'Turn' && typeof res.transcript === 'string' && res.transcript.trim()) {
          if (res.end_of_turn) {
            onFinalTranscript?.(res.transcript);
          } else {
            onPartialTranscript?.(res.transcript);
          }
        }

        if (res.type === 'Termination') {
          stop();
        }
      };

      socket.onerror = (err) => {
        setStatus('error');
        onError?.(err);
      };

      socket.onclose = () => {
        setIsRecording(false);
        setStatus((prev) => (prev === 'error' ? prev : 'idle'));
      };
    } catch (err) {
      setStatus('error');
      onError?.(err);
      stop();
    }
  }, [onFinalTranscript, onPartialTranscript, onError, stop]);

  return { start, stop, isRecording, status };
}
