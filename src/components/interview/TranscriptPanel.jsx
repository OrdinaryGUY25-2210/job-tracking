export default function TranscriptPanel({ entries, partialText, language }) {
  return (
    <section className="interview-panel">
      <div className="interview-panel-head">
        <span>{language === 'id' ? 'Transkrip Langsung' : 'Live Transcript'}</span>
        <span className="font-mono text-[10px] tracking-wide text-inkSoft">ASSEMBLYAI</span>
      </div>
      <div className="interview-panel-body">
        {entries.length === 0 && !partialText && (
          <p className="text-[13px] text-inkSoft font-mono">
            {language === 'id' ? 'Transkrip akan muncul di sini setelah kamu mulai merekam.' : 'Transcript will appear here once you start recording.'}
          </p>
        )}
        {entries.map((e) => (
          <p key={e.id} className="text-[13.5px] leading-relaxed mb-2.5 font-mono">
            <span className="text-inkSoft mr-2">{e.timestamp}</span>
            {e.text}
          </p>
        ))}
        {partialText && <p className="text-[13.5px] italic text-inkSoft font-mono">… {partialText}</p>}
      </div>
    </section>
  );
}
