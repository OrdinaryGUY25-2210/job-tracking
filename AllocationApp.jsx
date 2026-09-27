import { useState } from 'react';
import { useAllocation } from '../../hooks/useAllocation';
import CurrencyInput from './CurrencyInput';
import ConfirmModal from './ConfirmModal';
import { IconTrashFlat } from '../icons/Icons';

function formatRupiah(n) {
  return `Rp ${Math.round(n || 0).toLocaleString('id-ID')}`;
}

export default function AllocationApp({ userId, showToast }) {
  const {
    totalIncome,
    setTotalIncome,
    items,
    loaded,
    saving,
    error,
    addCategory,
    updateCategory,
    removeCategory,
    resetToDefault,
    save,
    totalPercentage,
  } = useAllocation(userId);

  const [confirmReset, setConfirmReset] = useState(false);

  if (!loaded) return <div className="py-16 text-center text-sm text-inkSoft">Memuat alokasi...</div>;

  const income = Number(totalIncome) || 0;
  const isOver = totalPercentage > 100;
  const isUnder = totalPercentage < 100;
  const hasEmptyName = items.some((it) => !it.category_name?.trim());
  const canSave = !isOver && !isUnder && !hasEmptyName && items.length > 0;

  const handleSave = async () => {
    const ok = await save();
    if (ok) showToast('updated', 'Alokasi tersimpan', `Total penghasilan ${formatRupiah(income)}`);
  };

  const handleReset = () => {
    resetToDefault();
    setConfirmReset(false);
  };

  return (
    <div className="app-section" style={{ animation: 'fadeIn 0.15s ease' }}>
      {error && <div className="mb-5 text-xs rounded-lg px-3 py-2 bg-rejectedBg text-rejected">{error}</div>}

      <div className="mb-2">
        <h2 className="font-display text-lg font-semibold text-ink">Berapa yang Boleh Dipakai?</h2>
        <p className="text-sm text-inkSoft mt-1">
          Masukkan penghasilan bulananmu, atur persentase tiap kategori, dan sistem menghitung batas maksimal
          pengeluaran per kategori secara otomatis.
        </p>
      </div>

      {/* Total Penghasilan */}
      <div className="bg-surface border border-line rounded-card p-4.5 my-5 max-w-sm">
        <label htmlFor="total-income" className="block text-xs font-medium text-inkSoft mb-1.5">
          Total Penghasilan (bulanan)
        </label>
        <CurrencyInput id="total-income" value={totalIncome} onChange={setTotalIncome} placeholder="0" />
      </div>

      {/* Warning real-time */}
      {isOver && (
        <div className="mb-4 text-sm rounded-lg px-3.5 py-2.5 bg-rejectedBg text-rejected font-medium">
          Total presentase melebihi 100%. Silakan sesuaikan.
        </div>
      )}
      {isUnder && (
        <div className="mb-4 text-sm rounded-lg px-3.5 py-2.5 bg-processingBg text-processing font-medium">
          Masih ada sisa {Math.round((100 - totalPercentage) * 100) / 100}% yang belum dialokasikan.
        </div>
      )}

      {/* Tabel kategori */}
      <div className="bg-surface border border-line rounded-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-lineSoft text-left text-xs text-inkSoft">
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium w-28">Persentase</th>
              <th className="px-4 py-3 font-medium w-40 text-right">Nominal Maksimal</th>
              <th className="px-4 py-3 font-medium w-12"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const pct = Number(it.percentage) || 0;
              const nominal = income * (pct / 100);
              return (
                <tr key={it._localId} className="border-b border-lineSoft last:border-0">
                  <td className="px-4 py-2.5">
                    <input
                      type="text"
                      value={it.category_name}
                      onChange={(e) => updateCategory(it._localId, { category_name: e.target.value })}
                      maxLength={40}
                      className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-ink font-medium"
                      placeholder="Nama kategori"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="relative w-20">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={it.percentage}
                        onChange={(e) => updateCategory(it._localId, { percentage: e.target.value.replace(/^-/, '') })}
                        className="w-full pr-5 text-right"
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-inkSoft text-xs pointer-events-none">%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-[13px] text-ink">{formatRupiah(nominal)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button onClick={() => removeCategory(it._localId)} title="Hapus kategori" className="opacity-50 hover:opacity-100">
                      <IconTrashFlat size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-paper">
              <td className="px-4 py-2.5 font-semibold text-ink text-[13px]">Total</td>
              <td className={`px-4 py-2.5 font-semibold text-[13px] ${isOver ? 'text-rejected' : isUnder ? 'text-processing' : 'text-accepted'}`}>
                {totalPercentage}%
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-[13px] font-semibold text-ink">{formatRupiah(income * (totalPercentage / 100))}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 mt-4">
        <button onClick={addCategory} className="btn-ghost">
          + Tambah Kategori
        </button>
        <button onClick={() => setConfirmReset(true)} className="btn-ghost">
          Reset ke Default
        </button>
        <div className="flex-1" />
        <button onClick={handleSave} disabled={!canSave || saving} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
          {saving ? 'Menyimpan...' : 'Simpan Alokasi'}
        </button>
      </div>

      {hasEmptyName && (
        <p className="text-xs text-rejected mt-2">Nama kategori tidak boleh kosong — isi atau hapus baris yang kosong sebelum menyimpan.</p>
      )}

      {confirmReset && (
        <ConfirmModal
          title="Kembalikan ke pengaturan default?"
          description="Perubahan kategori & persentase yang belum disimpan akan hilang. Total Penghasilan yang sudah diisi tidak ikut ter-reset."
          confirmLabel="Reset"
          onCancel={() => setConfirmReset(false)}
          onConfirm={handleReset}
        />
      )}
    </div>
  );
}
