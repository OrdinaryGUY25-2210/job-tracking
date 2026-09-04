import { useCallback, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// AssemblyAI realtime membutuhkan PCM16 mono 16kHz, bukan webm/opus.
// Karena itu kita pakai Web Audio API (AudioContext + ScriptProcessorNode)
// untuk mengambil sample mentah, lalu convert ke Int16 sebelum dikirim.

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

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
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
      socketRef.current.send(JSON.stringify({ terminate_session: true }));
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
        throw new Error(error?.message || 'Gagal mengambil token AssemblyAI');
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

      // 3. Buka WebSocket ke AssemblyAI realtime endpoint
      const socket = new WebSocket(
        `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=${TARGET_SAMPLE_RATE}&token=${data.token}`
      );
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus('listening');
        setIsRecording(true);

        processor.onaudioprocess = (event) => {
          const inputData = event.inputBuffer.getChannelData(0);
          const downsampled = downsampleBuffer(
            inputData,
            audioContext.sampleRate,
            TARGET_SAMPLE_RATE
          );
          const pcm16 = floatTo16BitPCM(downsampled);
          const base64Audio = arrayBufferToBase64(pcm16);

          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ audio_data: base64Audio }));
          }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
      };

      socket.onmessage = (message) => {
        const res = JSON.parse(message.data);
        if (res.message_type === 'PartialTranscript' && res.text) {
          onPartialTranscript?.(res.text);
        }
        if (res.message_type === 'FinalTranscript' && res.text) {
          onFinalTranscript?.(res.text);
        }
        if (res.message_type === 'SessionTerminated') {
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
