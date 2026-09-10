import { useState } from 'react';
import { BANK_PRESETS, bankColor } from '../../lib/finance';

export default function AccountModal({ initial, onClose, onSave }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial || { bank_name: '', account_number: '', account_holder: '', balance: '', color: '' }
  );

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.bank_name.trim()) return;
    onSave({
      ...form,
      ...(initial?.id ? { id: initial.id } : {}),
      account_number: form.account_number?.trim() || null,
      account_holder: form.account_holder?.trim() || null,
      balance: Number(form.balance) || 0,
      color: form.color || bankColor(form.bank_name),
    });
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={submit} className="modal-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-ink">{isEdit ? 'Ubah Rekening' : 'Tambah Rekening'}</h2>
          <button type="button" onClick={onClose} className="opacity-40 hover:opacity-80">
            ✕
          </button>
        </div>

        <div className="field">
          <label>Nama Bank / E-Wallet</label>
          <input
            required
            list="bank-presets"
            value={form.bank_name}
            onChange={set('bank_name')}
            placeholder="cth. BCA, Mandiri, DANA"
          />
          <datalist id="bank-presets">
            {Object.keys(BANK_PRESETS).map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>
        <div className="field">
          <label>Nomor Rekening (opsional)</label>
          <input value={form.account_number || ''} onChange={set('account_number')} placeholder="1234567890" />
        </div>
        <div className="field">
          <label>Atas Nama (opsional)</label>
          <input value={form.account_holder || ''} onChange={set('account_holder')} />
        </div>
        <div className="field">
          <label>Saldo Saat Ini (Rp)</label>
          <input type="number" min="0" step="1000" required value={form.balance} onChange={set('balance')} placeholder="0" />
        </div>

        <div className="flex gap-2.5 mt-6">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg py-2.5 text-sm font-medium bg-paper text-inkSoft">
            Batal
          </button>
          <button type="submit" className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-ink text-white">
            {isEdit ? 'Simpan Perubahan' : 'Tambah Rekening'}
          </button>
        </div>
      </form>
    </div>
  );
}
