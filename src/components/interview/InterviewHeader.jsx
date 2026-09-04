export default function InterviewHeader({ isRecording, status, language, onLanguageChange, onToggleRecord, onToggleHistory }) {
  const statusLabels = {
    idle: language === 'id' ? 'Siap' : 'Ready',
    connecting: language === 'id' ? 'Menghubungkan…' : 'Connecting…',
    listening: language === 'id' ? 'Mendengarkan' : 'Listening',
    error: language === 'id' ? 'Terjadi kesalahan' : 'Error',
  };
  const recordLabel = isRecording ? (language === 'id' ? 'Hentikan' : 'Stop') : language === 'id' ? 'Mulai Rekam' : 'Start Recording';

  return (
    <div className="card flex items-center gap-3.5 flex-wrap px-4.5 py-3.5 mb-4">
      <div className="flex items-center gap-2">
        <span className={`rec-dot ${status === 'listening' ? 'live' : ''}`} />
        <span className="text-[13px] text-inkSoft font-medium">{statusLabels[status] || status}</span>
      </div>
      <div className="flex gap-1.5">
        <button onClick={() => onLanguageChange('id')} className={`chip ${language === 'id' ? 'active' : ''}`}>
          ID
        </button>
        <button onClick={() => onLanguageChange('en')} className={`chip ${language === 'en' ? 'active' : ''}`}>
          EN
        </button>
      </div>
      <button onClick={onToggleRecord} className="btn-primary" style={{ background: '#6B5FA3' }}>
        {recordLabel}
      </button>
      <button onClick={onToggleHistory} className="btn-ghost">
        Riwayat Sesi
      </button>
    </div>
  );
}
