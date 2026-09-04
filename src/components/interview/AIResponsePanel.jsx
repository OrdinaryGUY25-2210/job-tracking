export default function AIResponsePanel({ responses, isThinking, language }) {
  return (
    <section className="interview-panel">
      <div className="interview-panel-head">
        <span>{language === 'id' ? 'Saran Jawaban AI' : 'AI Suggested Answer'}</span>
        {isThinking && <span className="text-[10px] tracking-wide text-interview font-semibold">{language === 'id' ? 'MENYUSUN…' : 'THINKING…'}</span>}
      </div>
      <div className="interview-panel-body">
        {responses.length === 0 && (
          <p className="text-[13px] text-inkSoft font-mono">
            {language === 'id' ? 'Respons AI akan muncul di sini berdasarkan pertanyaan yang terdeteksi.' : 'AI responses will appear here based on detected questions.'}
          </p>
        )}
        {responses.map((r) => (
          <div key={r.id} className="bg-paper border border-line rounded-xl px-3.5 py-3 mb-3">
            <p className="text-[11.5px] font-mono text-interview mb-1.5">{r.question}</p>
            <p className="text-[13.5px] leading-relaxed text-ink">{r.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
