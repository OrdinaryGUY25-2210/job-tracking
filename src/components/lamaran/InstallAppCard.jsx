import { useInstallPrompt } from '../../hooks/useInstallPrompt';

export default function InstallAppCard() {
  const { canInstall, installed, promptInstall } = useInstallPrompt();

  if (installed) return null;
  if (!canInstall) return null;

  return (
    <div className="card p-5 flex items-center justify-between gap-4 mb-6 flex-wrap" style={{ background: '#EFEAF7', borderColor: '#6B5FA3' }}>
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-interview/15 flex items-center justify-center shrink-0" style={{ background: '#6B5FA320' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="2" width="16" height="20" rx="2.5" stroke="#6B5FA3" strokeWidth="1.6" />
            <path d="M12 7v7M9 11l3 3 3-3" stroke="#6B5FA3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M9 19h6" stroke="#6B5FA3" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Pasang sebagai aplikasi</p>
          <p className="text-[12.5px] text-inkSoft mt-0.5">Akses lebih cepat dari layar utama, tanpa buka browser dulu.</p>
        </div>
      </div>
      <button onClick={promptInstall} className="btn-primary shrink-0" style={{ background: '#6B5FA3' }}>
        Install Aplikasi
      </button>
    </div>
  );
}
