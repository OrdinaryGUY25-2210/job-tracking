import { useCallback, useRef, useState } from 'react';
import InterviewHeader from './InterviewHeader';
import TranscriptPanel from './TranscriptPanel';
import AIResponsePanel from './AIResponsePanel';
import SessionHistoryPanel from './SessionHistoryPanel';
import { useLiveTranscription } from '../../hooks/useLiveTranscription';
import { supabase } from '../../lib/supabaseClient';

function formatTime() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function InterviewApp() {
  const [language, setLanguage] = useState('id');
  const [entries, setEntries] = useState([]);
  const [partialText, setPartialText] = useState('');
  const [responses, setResponses] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const sessionIdRef = useRef(null);

  const handleFinalTranscript = useCallback(
    async (text) => {
      const id = crypto.randomUUID();
      setEntries((prev) => [...prev, { id, text, timestamp: formatTime() }]);
      setPartialText('');
      setIsThinking(true);
      setErrorMessage('');

      try {
        const { data, error } = await supabase.functions.invoke('get-ai-response', {
          body: { transcript: text, language, sessionId: sessionIdRef.current },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setResponses((prev) => [...prev, { id: crypto.randomUUID(), question: text, answer: data.response }]);
        if (data.sessionId) sessionIdRef.current = data.sessionId;
      } catch (err) {
        setErrorMessage(
          (language === 'id' ? 'Gagal mendapatkan respons AI. Coba lagi. ' : 'Failed to get AI response. Please try again. ') +
            'Pastikan Edge Function "get-ai-response" sudah di-deploy.'
        );
        console.error(err);
      } finally {
        setIsThinking(false);
      }
    },
    [language]
  );

  const handlePartialTranscript = useCallback((text) => setPartialText(text), []);
  const handleError = useCallback(
    (err) => {
      console.error(err);
      setErrorMessage(
        language === 'id' ? 'Terjadi masalah dengan koneksi audio/transkripsi.' : 'There was a problem with the audio/transcription connection.'
      );
    },
    [language]
  );

  const { start, stop, isRecording, status } = useLiveTranscription({
    onPartialTranscript: handlePartialTranscript,
    onFinalTranscript: handleFinalTranscript,
    onError: handleError,
  });

  return (
    <div className="app-section" style={{ animation: 'fadeIn 0.15s ease' }}>
      <InterviewHeader
        isRecording={isRecording}
        status={status}
        language={language}
        onLanguageChange={setLanguage}
        onToggleRecord={() => (isRecording ? stop() : start())}
        onToggleHistory={() => setShowHistory((v) => !v)}
      />

      {errorMessage && <div className="text-[12.5px] bg-rejectedBg text-rejected p-3 rounded-lg mb-4">{errorMessage}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <TranscriptPanel entries={entries} partialText={partialText} language={language} />
        <AIResponsePanel responses={responses} isThinking={isThinking} language={language} />
      </div>

      {showHistory && <SessionHistoryPanel />}
    </div>
  );
}
