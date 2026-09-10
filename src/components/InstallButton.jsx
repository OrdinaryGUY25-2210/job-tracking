import { useState } from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

// Tombol install yang tampil di header, jadi bisa dipencet dari halaman manapun
// (Lacak Lamaran, Interview Assistant, atau Keuangan), bukan cuma dari dashboard.
// - Android/Desktop Chrome & Edge: pakai event "beforeinstallprompt" bawaan browser.
// - iOS Safari tidak punya event itu sama sekali, jadi kita kasih panduan manual
//   "Share > Add to Home Screen" lewat popover kecil.
function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallButton() {
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const [showIosTip, setShowIosTip] = useState(false);
  const ios = isIos();

  if (installed) return null;
  if (!canInstall && !ios) return null;

  const handleClick = () => {
    if (canInstall) {
      promptInstall();
    } else if (ios) {
      setShowIosTip((v) => !v);
    }
  };

  return (
    <div className="relative">
      <button onClick={handleClick} className="btn-ghost flex items-center gap-1.5" title="Pasang sebagai aplikasi">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="2" width="16" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 7v7M9 11l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M9 19h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">Install</span>
      </button>

      {showIosTip && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-64 bg-surface border border-line rounded-xl shadow-2xl p-3.5 z-[80] text-[13px] text-inkSoft">
          <p className="font-semibold text-ink mb-1.5">Pasang di iPhone/iPad</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Ketuk tombol <b>Share</b> (ikon kotak dengan panah ke atas) di Safari
            </li>
            <li>
              Pilih <b>Add to Home Screen</b>
            </li>
            <li>Ketuk Add — ikon aplikasi muncul di layar utama</li>
          </ol>
          <button onClick={() => setShowIosTip(false)} className="mt-2.5 text-xs font-medium text-ink underline">
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}
