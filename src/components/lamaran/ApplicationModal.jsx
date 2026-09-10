import { useEffect, useRef, useState } from 'react';
import { STATUS_META, todayISO } from '../../lib/constants';

export default function ApplicationModal({ initial, onClose, onSave }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial || {
      company: '',
      position: '',
      date_applied: todayISO(),
      status: 'Dilamar',
      link: '',
      notes: '',
      requires_manual_apply: false,
    }
  );
  const firstRef = useRef(null);

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.company.trim() || !form.position.trim()) return;
    onSave({
      ...form,
      ...(initial?.id ? { id: initial.id } : {}),
      link: form.link?.trim() || null,
      notes: form.notes?.trim() || null,
    });
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={submit} className="modal-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-ink">{isEdit ? 'Ubah Lamaran' : 'Tambah Lamaran'}</h2>
          <button type="button" onClick={onClose} className="opacity-40 hover:opacity-80">
            ✕
          </button>
        </div>

        <div className="space-y-3.5">
          <div className="field">
            <label>Nama Perusahaan</label>
            <input ref={firstRef} required value={form.company} onChange={set('company')} placeholder="cth. Tokopedia" />
          </div>
          <div className="field">
            <label>Posisi</label>
            <input required value={form.position} onChange={set('position')} placeholder="cth. Frontend Engineer" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field">
              <label>Tanggal Melamar</label>
              <input type="date" value={form.date_applied} onChange={set('date_applied')} max={todayISO()} />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={set('status')}>
                {Object.entries(STATUS_META).map(([val, m]) => (
                  <option key={val} value={val}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Tautan Lowongan (opsional)</label>
            <input value={form.link || ''} onChange={set('link')} placeholder="https://..." />
          </div>
          <div className="field">
            <label>Catatan (opsional)</label>
            <textarea rows={2} value={form.notes || ''} onChange={set('notes')} placeholder="Kontak HR, hasil interview, dll." />
          </div>
          <label className="flex items-center gap-2 text-[13px] text-inkSoft mb-1.5 cursor-pointer">
            <input type="checkbox" checked={!!form.requires_manual_apply} onChange={set('requires_manual_apply')} className="w-4 h-4" />
            Perlu daftar manual di portal perusahaan (tidak bisa dikirim via email)
          </label>
        </div>

        <div className="flex gap-2.5 mt-6">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg py-2.5 text-sm font-medium bg-paper text-inkSoft hover:opacity-80">
            Batal
          </button>
          <button type="submit" className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-ink text-white hover:opacity-90">
            {isEdit ? 'Simpan Perubahan' : 'Tambah Lamaran'}
          </button>
        </div>
      </form>
    </div>
  );
}
