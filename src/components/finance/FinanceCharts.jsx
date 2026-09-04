import { CATEGORY_COLORS, formatRupiah } from '../../lib/finance';
import { IconTray, IconTrendDown } from '../icons/Icons';

function MonthlyTrend({ expenses }) {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    d.setDate(1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }), total: 0 });
  }
  expenses.forEach((e) => {
    const d = new Date(e.expense_date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((mo) => mo.key === key);
    if (m) m.total += Number(e.amount || 0);
  });
  const max = Math.max(1, ...months.map((m) => m.total));

  return (
    <div className="card p-5">
      <p className="font-display text-sm font-semibold mb-4 text-ink">Tren Pengeluaran — 6 Bulan Terakhir</p>
      <div className="flex items-end gap-2 h-40">
        {months.map((m) => (
          <div key={m.key} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5" title={`${m.label}: ${formatRupiah(m.total)}`}>
            <div className="w-full max-w-[36px] bg-rejected rounded-t hover:opacity-75 transition-opacity" style={{ height: `${Math.max((m.total / max) * 100, m.total > 0 ? 6 : 2)}%`, minHeight: 3 }} />
            <span className="text-[10px] text-inkSoft whitespace-nowrap">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryBreakdown({ expenses }) {
  const totals = {};
  expenses.forEach((e) => {
    totals[e.category] = (totals[e.category] || 0) + Number(e.amount || 0);
  });
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const grandTotal = entries.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="card p-5">
      <p className="font-display text-sm font-semibold mb-4 text-ink">Pengeluaran per Kategori</p>
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-inkSoft text-[13px]">
          <IconTray color="#5B6478" size={30} />
          <span>Belum ada data</span>
        </div>
      ) : (
        <>
          <div
            className="w-[150px] h-[150px] rounded-full mx-auto relative"
            style={{
              background: (() => {
                let acc = 0;
                const segs = entries.map(([cat, val]) => {
                  const pct = (val / grandTotal) * 100;
                  const seg = `${CATEGORY_COLORS[cat] || '#5B6478'} ${acc}% ${acc + pct}%`;
                  acc += pct;
                  return seg;
                });
                return `conic-gradient(${segs.join(', ')})`;
              })(),
            }}
          >
            <div className="absolute inset-6 bg-surface rounded-full" />
          </div>
          <div className="flex flex-col gap-2 mt-4">
            {entries.map(([cat, val]) => (
              <div key={cat} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-inkSoft">
                  <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[cat] || '#5B6478' }} />
                  {cat}
                </span>
                <span className="font-mono font-semibold text-ink">{formatRupiah(val)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function FinanceCharts({ expenses }) {
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthTotal = expenses
    .filter((e) => {
      const d = new Date(e.expense_date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((s, e) => s + Number(e.amount || 0), 0);

  return (
    <div>
      <div className="card p-5 flex items-center gap-4 mb-3.5">
        <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-rejectedBg">
          <IconTrendDown />
        </div>
        <div>
          <p className="font-mono text-2xl font-semibold leading-none text-ink">{formatRupiah(monthTotal)}</p>
          <p className="text-xs mt-1.5 text-inkSoft font-medium">Total Pengeluaran Bulan Ini</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        <div className="lg:col-span-2">
          <MonthlyTrend expenses={expenses} />
        </div>
        <CategoryBreakdown expenses={expenses} />
      </div>
    </div>
  );
}
