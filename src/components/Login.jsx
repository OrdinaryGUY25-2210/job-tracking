import { useState } from 'react';
import { GOOGLE_LOGIN_TRANSITION_ENABLED } from '../lib/supabaseClient';

export default function Login({ onSignIn, onSignUp, onResetPassword, onGoogleLogin }) {
  const [mode, setMode] = useState('signin'); // signin | signup | reset
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (mode === 'signup' && password !== confirmPassword) {
      setMsg('Konfirmasi password tidak cocok.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await onSignIn(email, password);
        if (error) setMsg(error.message);
      } else if (mode === 'signup') {
        const { error } = await onSignUp(email, password);
        if (error) setMsg(error.message);
        else setMsg('Akun dibuat. Cek email kamu untuk konfirmasi (kalau diminta), lalu masuk.');
      } else if (mode === 'reset') {
        const { error } = await onResetPassword(email);
        if (error) setMsg(error.message);
        else setMsg('Link reset password sudah dikirim ke email kamu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex items-center justify-center p-5"
      style={{ paddingTop: 'max(20px, env(safe-area-inset-top))', paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
    >
      <div className="bg-surface border border-line rounded-[20px] p-10 max-w-[380px] w-full">
        <img src="/icon-192.png" alt="Cortex" className="mx-auto mb-4.5 block w-14 h-14 rounded-[14px]" />
        <h1 className="font-display text-[22px] font-bold mb-2 text-center">Cortex</h1>
        <p className="text-inkSoft text-sm mb-6 text-center leading-relaxed">
          {mode === 'signin' && 'Masuk untuk mulai memantau lamaran, keuangan, dan Interview Assistant-mu.'}
          {mode === 'signup' && 'Buat akun baru dengan email dan password.'}
          {mode === 'reset' && 'Masukkan email untuk menerima link reset password.'}
        </p>

        <form onSubmit={submit} className="space-y-3">
          <div className="field">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" />
          </div>
          {mode !== 'reset' && (
            <div className="field">
              <label>Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} />
            </div>
          )}
          {mode === 'signup' && (
            <div className="field">
              <label>Konfirmasi Password</label>
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" minLength={6} />
            </div>
          )}

          {msg && <p className="text-[12.5px] text-inkSoft bg-paper rounded-lg px-3 py-2">{msg}</p>}

          <button type="submit" disabled={loading} className="w-full rounded-xl py-3 text-sm font-semibold bg-ink text-white hover:opacity-90 disabled:opacity-50">
            {loading ? 'Memproses...' : mode === 'signin' ? 'Masuk' : mode === 'signup' ? 'Daftar' : 'Kirim Link Reset'}
          </button>
        </form>

        <div className="flex justify-between mt-4 text-[12.5px]">
          {mode === 'signin' ? (
            <>
              <button onClick={() => { setMode('signup'); setMsg(''); }} className="text-submitted font-medium">
                Belum punya akun? Daftar
              </button>
              <button onClick={() => { setMode('reset'); setMsg(''); }} className="text-inkSoft">
                Lupa password?
              </button>
            </>
          ) : (
            <button onClick={() => { setMode('signin'); setMsg(''); }} className="text-submitted font-medium">
              ← Kembali ke halaman masuk
            </button>
          )}
        </div>

        {GOOGLE_LOGIN_TRANSITION_ENABLED && mode === 'signin' && (
          <>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-line" />
              <span className="text-[11px] text-inkSoft">AKUN LAMA</span>
              <div className="flex-1 h-px bg-line" />
            </div>
            <button
              onClick={onGoogleLogin}
              className="w-full flex items-center justify-center gap-2.5 bg-surface border border-line rounded-xl py-2.5 px-4 text-[13px] font-medium text-ink hover:bg-paper transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.33A9 9 0 0 0 9 18Z" />
                <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.05l3.02-2.33Z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
              </svg>
              Masuk dengan Google (akun lama)
            </button>
            <p className="text-[11px] text-inkSoft text-center mt-2.5">
              Sudah pernah pakai akun Google di sini? Masuk lewat ini sekali lagi, lalu setel password supaya bisa pakai form di atas selanjutnya.
            </p>
          </>
        )}

        <p className="text-xs text-inkSoft mt-5 text-center">Data kamu bersifat privat dan hanya bisa diakses oleh akunmu sendiri.</p>
      </div>
    </div>
  );
}
