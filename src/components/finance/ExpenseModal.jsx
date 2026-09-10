import { useState } from 'react';
import { EXPENSE_CATEGORIES } from '../../lib/finance';
import { todayISO } from '../../lib/constants';

export default function ExpenseModal({ initial, accounts, onClose, onSave }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial || {
      category: EXPENSE_CATEGORIES[0],
      amount: '',
      note: '',
      expense_date: todayISO(),
      account_id: accounts[0]?.id || '',
    }
  );

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.category || !form.amount) return;
    onSave({
      ...form,
      ...(initial?.id ? { id: initial.id } : {}),
      amount: Number(form.amount),
      note: form.note?.trim() || null,
      account_id: form.account_id || null,
    });
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={submit} className="modal-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-ink">{isEdit ? 'Ubah Pengeluaran' : 'Tambah Pengeluaran'}</h2>
          <button type="button" onClick={onClose} className="opacity-40 hover:opacity-80">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="field">
            <label>Kategori</label>
            <select value={form.category} onChange={set('category')}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Nominal (Rp)</label>
            <input type="number" min="0" step="1000" required value={form.amount} onChange={set('amount')} placeholder="0" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="field">
            <label>Tanggal</label>
            <input type="date" value={form.expense_date} onChange={set('expense_date')} max={todayISO()} />
          </div>
          <div className="field">
            <label>Sumber Dana (opsional)</label>
            <select value={form.account_id || ''} onChange={set('account_id')}>
              <option value="">- Tidak ditentukan -</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.bank_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label>Catatan (opsional)</label>
          <input value={form.note || ''} onChange={set('note')} placeholder="cth. Makan siang tim" />
        </div>

        <div className="flex gap-2.5 mt-6">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg py-2.5 text-sm font-medium bg-paper text-inkSoft">
            Batal
          </button>
          <button type="submit" className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-ink text-white">
            {isEdit ? 'Simpan Perubahan' : 'Tambah Pengeluaran'}
          </button>
        </div>
      </form>
    </div>
  );
}
