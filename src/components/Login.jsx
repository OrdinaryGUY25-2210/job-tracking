export default function Login({ onLogin }) {
  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-5" style={{ paddingTop: 'max(20px, env(safe-area-inset-top))', paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}>
      <div className="bg-surface border border-line rounded-[20px] p-10 max-w-[380px] w-full text-center">
        <svg className="mx-auto mb-4.5" width="56" height="56" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="9" width="24" height="17" rx="3" fill="#1F2A44" opacity="0.14" />
          <path d="M5 9.5A2.5 2.5 0 0 1 7.5 7h17A2.5 2.5 0 0 1 27 9.5V15h-6.2a1 1 0 0 0-.85.47l-1.1 1.75a1 1 0 0 1-.85.48h-4a1 1 0 0 1-.85-.48l-1.1-1.75A1 1 0 0 0 11.2 15H5V9.5Z" fill="#1F2A44" />
          <rect x="5" y="15" width="22" height="10.5" rx="2.4" fill="#1F2A44" opacity="0.9" />
        </svg>
        <h1 className="font-display text-[22px] font-bold mb-2">Lacak Lamaran</h1>
        <p className="text-inkSoft text-sm mb-6 leading-relaxed">
          Masuk untuk mulai memantau proses lamaran kerjamu dan pakai Interview Assistant — pengganti spreadsheet yang lebih rapi.
        </p>
        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-2.5 bg-surface border border-line rounded-xl py-3 px-4 text-sm font-semibold text-ink hover:bg-paper transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.33A9 9 0 0 0 9 18Z" />
            <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.05l3.02-2.33Z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
          </svg>
          Masuk dengan Google
        </button>
        <p className="text-xs text-inkSoft mt-4.5">Data lamaranmu bersifat privat dan hanya bisa diakses oleh akunmu sendiri.</p>
      </div>
    </div>
  );
}
