import { useState } from 'react';
import { formatRupiah } from '../../lib/finance';
import { IconBank, IconCopy, IconTray } from '../icons/Icons';

function CopyButton({ text, showToast }) {
  const [copied, setCopied] = useState(false);
  if (!text) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('updated', 'Nomor rekening disalin', text);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast('rejected', 'Gagal menyalin', 'Coba salin manual.');
    }
  };
  return (
    <button onClick={copy} className="inline-flex items-center gap-1 text-inkSoft hover:text-ink transition-colors" title="Salin nomor rekening">
      <IconCopy size={13} />
      {copied && <span className="text-[10px] text-accepted">Tersalin</span>}
    </button>
  );
}

export default function AccountsTable({ accounts, totalBalance, onAdd, onEdit, onDelete, showToast }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-lineSoft">
        <div>
          <p className="font-display text-sm font-semibold text-ink">Rekening & E-Wallet</p>
          <p className="text-xs text-inkSoft mt-0.5">Total Penyimpanan</p>
          <p className="font-mono text-2xl font-semibold text-ink mt-0.5">{formatRupiah(totalBalance)}</p>
        </div>
        <button onClick={onAdd} className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 2v11M2 7.5h11" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          Tambah Rekening
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="table-empty-state">
          <IconTray color="#5B6478" size={32} />
          <p>Belum ada rekening tersimpan.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="border-b border-line">
                {['Bank / E-Wallet', 'No. Rekening', 'Atas Nama', 'Saldo', ''].map((h) => (
                  <th key={h} className="text-left px-4.5 py-2.5 text-xs font-medium text-inkSoft">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className="border-b border-lineSoft last:border-0">
                  <td className="px-4.5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: (a.color || '#1F2A44') + '20' }}>
                        <IconBank color={a.color || '#1F2A44'} size={16} />
                      </div>
                      <span className="font-medium text-ink">{a.bank_name}</span>
                    </div>
                  </td>
                  <td className="px-4.5 py-3">
                    <div className="flex items-center gap-2 font-mono text-[12.5px] text-inkSoft">
                      {a.account_number || '-'}
                      <CopyButton text={a.account_number} showToast={showToast} />
                    </div>
                  </td>
                  <td className="px-4.5 py-3 text-inkSoft">{a.account_holder || '-'}</td>
                  <td className="px-4.5 py-3 font-mono font-semibold text-ink">{formatRupiah(a.balance)}</td>
                  <td className="px-4.5 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => onEdit(a)} className="p-1.5 rounded-lg hover:bg-black/5" title="Ubah">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M2.5 13.5l.6-2.4L10.9 3.3a1.3 1.3 0 0 1 1.8 0l.4.4a1.3 1.3 0 0 1 0 1.8L5.3 13.3l-2.4.6" stroke="#5B6478" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button onClick={() => onDelete(a)} className="p-1.5 rounded-lg hover:bg-black/5" title="Hapus">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M2.5 4.5h11M6.3 4.5V3a1 1 0 0 1 1-1h1.4a1 1 0 0 1 1 1v1.5M4.5 4.5v8.2a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4.5M6.7 7.5v3.6M9.3 7.5v3.6" stroke="#5B6478" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-paper">
                <td colSpan={3} className="px-4.5 py-3 font-semibold text-ink text-[13px]">
                  Total Penyimpanan
                </td>
                <td colSpan={2} className="px-4.5 py-3 font-mono font-bold text-ink">
                  {formatRupiah(totalBalance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
