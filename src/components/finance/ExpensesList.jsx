import { useMemo, useState } from 'react';
import { EXPENSE_CATEGORIES, CATEGORY_COLORS, formatRupiah } from '../../lib/finance';
import { fmtDate } from '../../lib/constants';
import { IconTray } from '../icons/Icons';

export default function ExpensesList({ expenses, accounts, onAdd, onEdit, onDelete }) {
  const [filter, setFilter] = useState('SEMUA');

  const filtered = useMemo(() => {
    return filter === 'SEMUA' ? expenses : expenses.filter((e) => e.category === filter);
  }, [expenses, filter]);

  const accountName = (id) => accounts.find((a) => a.id === id)?.bank_name;

  return (
    <div>
      <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2.5">
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilter('SEMUA')} className={`chip ${filter === 'SEMUA' ? 'active' : ''}`}>
            Semua
          </button>
          {EXPENSE_CATEGORIES.map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={`chip ${filter === c ? 'active' : ''}`}>
              {c}
            </button>
          ))}
        </div>
        <button onClick={onAdd} className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 2v11M2 7.5h11" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          Tambah Pengeluaran
        </button>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="table-empty-state">
            <IconTray color="#5B6478" size={32} />
            <p>Belum ada pengeluaran tercatat.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-line">
                  {['Tanggal', 'Kategori', 'Catatan', 'Sumber Dana', 'Nominal', ''].map((h) => (
                    <th key={h} className="text-left px-4.5 py-2.5 text-xs font-medium text-inkSoft">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-lineSoft last:border-0">
                    <td className="px-4.5 py-3 font-mono text-[12.5px] text-inkSoft">{fmtDate(e.expense_date)}</td>
                    <td className="px-4.5 py-3">
                      <span
                        className="status-badge"
                        style={{ background: (CATEGORY_COLORS[e.category] || '#5B6478') + '20', color: CATEGORY_COLORS[e.category] || '#5B6478' }}
                      >
                        {e.category}
                      </span>
                    </td>
                    <td className="px-4.5 py-3 text-inkSoft">{e.note || '-'}</td>
                    <td className="px-4.5 py-3 text-inkSoft">{accountName(e.account_id) || '-'}</td>
                    <td className="px-4.5 py-3 font-mono font-semibold text-rejected">{formatRupiah(e.amount)}</td>
                    <td className="px-4.5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => onEdit(e)} className="p-1.5 rounded-lg hover:bg-black/5" title="Ubah">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M2.5 13.5l.6-2.4L10.9 3.3a1.3 1.3 0 0 1 1.8 0l.4.4a1.3 1.3 0 0 1 0 1.8L5.3 13.3l-2.4.6" stroke="#5B6478" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button onClick={() => onDelete(e)} className="p-1.5 rounded-lg hover:bg-black/5" title="Hapus">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M2.5 4.5h11M6.3 4.5V3a1 1 0 0 1 1-1h1.4a1 1 0 0 1 1 1v1.5M4.5 4.5v8.2a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4.5M6.7 7.5v3.6M9.3 7.5v3.6" stroke="#5B6478" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
