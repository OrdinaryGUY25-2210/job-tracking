import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AccountMigrationBanner({ user, onDone }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const isGoogleAccount = user?.app_metadata?.provider === 'google' || user?.identities?.some((i) => i.provider === 'google');
  const dismissedKey = `password_migrated_${user?.id}`;
  const alreadyDone = typeof window !== 'undefined' && localStorage.getItem(dismissedKey) === '1';

  if (!isGoogleAccount || alreadyDone) return null;

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (password.length < 6) {
      setMsg('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirm) {
      setMsg('Konfirmasi password tidak cocok.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    localStorage.setItem(dismissedKey, '1');
    setOpen(false);
    onDone?.();
  };

  return (
    <div className="mb-6 rounded-2xl border border-line bg-interviewBg/40 p-4.5" style={{ background: '#EFEAF7' }}>
      {!open ? (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">Akunmu masih pakai login Google</p>
            <p className="text-[12.5px] text-inkSoft mt-0.5">
              Setel password sekarang supaya akun ini (dengan semua data lamamu) tetap bisa dipakai setelah login Google dinonaktifkan.
            </p>
          </div>
          <button onClick={() => setOpen(true)} className="btn-primary shrink-0" style={{ background: '#6B5FA3' }}>
            Setel Password
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="max-w-sm">
          <p className="text-sm font-semibold text-ink mb-3">Setel password untuk {user.email}</p>
          <div className="field">
            <label>Password Baru</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="field">
            <label>Konfirmasi Password</label>
            <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
          </div>
          {msg && <p className="text-[12.5px] text-rejected mb-2">{msg}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg py-2 px-3.5 text-sm font-medium bg-paper text-inkSoft">
              Batal
            </button>
            <button type="submit" disabled={saving} className="rounded-lg py-2 px-3.5 text-sm font-semibold bg-ink text-white disabled:opacity-50">
              {saving ? 'Menyimpan...' : 'Simpan Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
