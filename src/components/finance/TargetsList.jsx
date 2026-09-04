import { useState } from 'react';
import { formatRupiah } from '../../lib/finance';
import { fmtDate } from '../../lib/constants';
import { IconTarget, IconTray } from '../icons/Icons';

export function TargetModal({ initial, onClose, onSave }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(initial || { name: '', target_amount: '', deadline: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.target_amount) return;
    onSave({ ...form, id: initial?.id, target_amount: Number(form.target_amount), deadline: form.deadline || null });
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={submit} className="modal-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-ink">{isEdit ? 'Ubah Target' : 'Tambah Target Tabungan'}</h2>
          <button type="button" onClick={onClose} className="opacity-40 hover:opacity-80">
            ✕
          </button>
        </div>
        <div className="field">
          <label>Nama Target</label>
          <input required value={form.name} onChange={set('name')} placeholder="cth. Dana Darurat, DP Rumah" />
        </div>
        <div className="field">
          <label>Nominal Target (Rp)</label>
          <input type="number" min="0" step="10000" required value={form.target_amount} onChange={set('target_amount')} />
        </div>
        <div className="field">
          <label>Tenggat (opsional)</label>
          <input type="date" value={form.deadline || ''} onChange={set('deadline')} />
        </div>
        <div className="flex gap-2.5 mt-6">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg py-2.5 text-sm font-medium bg-paper text-inkSoft">
            Batal
          </button>
          <button type="submit" className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-ink text-white">
            {isEdit ? 'Simpan Perubahan' : 'Tambah Target'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function TargetsList({ targets, totalBalance, onAdd, onEdit, onDelete }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-lineSoft">
        <p className="font-display text-sm font-semibold text-ink">Target Tabungan</p>
        <button onClick={onAdd} className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 2v11M2 7.5h11" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          Tambah Target
        </button>
      </div>
      {targets.length === 0 ? (
        <div className="table-empty-state">
          <IconTray color="#5B6478" size={32} />
          <p>Belum ada target tabungan.</p>
        </div>
      ) : (
        <div className="p-5 space-y-4">
          {targets.map((t) => {
            const pct = Math.min(100, Math.round((totalBalance / t.target_amount) * 100));
            return (
              <div key={t.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <IconTarget size={18} />
                    <span className="text-sm font-semibold text-ink">{t.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(t)} className="p-1.5 rounded-lg hover:bg-black/5" title="Ubah">
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path d="M2.5 13.5l.6-2.4L10.9 3.3a1.3 1.3 0 0 1 1.8 0l.4.4a1.3 1.3 0 0 1 0 1.8L5.3 13.3l-2.4.6" stroke="#5B6478" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button onClick={() => onDelete(t)} className="p-1.5 rounded-lg hover:bg-black/5" title="Hapus">
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path d="M2.5 4.5h11M6.3 4.5V3a1 1 0 0 1 1-1h1.4a1 1 0 0 1 1 1v1.5M4.5 4.5v8.2a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4.5M6.7 7.5v3.6M9.3 7.5v3.6" stroke="#5B6478" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-paper rounded-full overflow-hidden">
                  <div className="h-full bg-accepted rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-inkSoft">
                  <span>
                    {formatRupiah(totalBalance)} / {formatRupiah(t.target_amount)} ({pct}%)
                  </span>
                  {t.deadline && <span>Tenggat: {fmtDate(t.deadline)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
