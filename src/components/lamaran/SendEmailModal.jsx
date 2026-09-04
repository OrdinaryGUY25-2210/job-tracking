import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { buildTailoredCvBlob, buildCoverLetterBlob, blobToBase64 } from '../../lib/docxBuilder';

export default function SendEmailModal({ app, profile, onClose, onSent, showToast }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState(`Lamaran Posisi ${app.position} — ${profile?.full_name || ''}`.trim());
  const [body, setBody] = useState(app.cover_letter || '');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  const confirmSend = async () => {
    if (!to.trim()) {
      setMsg('Isi dulu email tujuan.');
      return;
    }
    setSending(true);
    setMsg('Menyiapkan lampiran...');
    try {
      const cv = JSON.parse(app.tailored_cv);
      const cvBlob = await buildTailoredCvBlob(cv);
      const attachments = [{ filename: `CV - ${app.company}.docx`, contentBase64: await blobToBase64(cvBlob) }];
      if (app.cover_letter) {
        const clBlob = await buildCoverLetterBlob(app.cover_letter);
        attachments.push({ filename: `Cover Letter - ${app.company}.docx`, contentBase64: await blobToBase64(clBlob) });
      }

      setMsg('Mengirim email...');
      const { data, error } = await supabase.functions.invoke('send-application', {
        body: { to, subject, body, fromName: profile?.full_name || '', attachments },
      });
      if (error) throw new Error(error.message || 'Gagal mengirim.');
      if (data?.error) throw new Error(data.error);

      await onSent({ emailed_at: new Date().toISOString() });
      showToast('added', 'Email lamaran terkirim', `${app.position} · ${to}`);
      onClose();
    } catch (err) {
      setMsg('Gagal: ' + (err.message || String(err)) + ' — pastikan Edge Function "send-application" & secret SMTP sudah di-set (lihat PANDUAN-TAMBAHAN.md).');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-ink">Kirim Lamaran via Email</h2>
          <button onClick={onClose} className="opacity-40 hover:opacity-80">
            ✕
          </button>
        </div>
        <p className="text-[12.5px] text-inkSoft mb-3.5">CV & Cover Letter akan dilampirkan otomatis (.docx). Cek dulu isinya sebelum kirim.</p>
        <div className="field">
          <label>Kepada (email HRD/perusahaan)</label>
          <input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="hr@perusahaan.com" required />
        </div>
        <div className="field">
          <label>Subjek</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="field">
          <label>Isi Email</label>
          <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <p className="text-xs text-inkSoft min-h-[16px]">{msg}</p>
        <div className="flex gap-2.5 mt-2">
          <button onClick={onClose} className="flex-1 rounded-lg py-2.5 text-sm font-medium bg-paper text-inkSoft">
            Batal
          </button>
          <button disabled={sending} onClick={confirmSend} className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-ink text-white disabled:opacity-50">
            Kirim Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
