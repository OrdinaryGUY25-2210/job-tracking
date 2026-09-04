import { STATUS_META } from '../../lib/constants';
import { IconTray } from '../icons/Icons';

function TrendChart({ applications }) {
  const days = 14;
  const counts = [];
  let max = 1;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const count = applications.filter((a) => a.date_applied === iso).length;
    counts.push({ iso, label: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }), count });
    if (count > max) max = count;
  }

  return (
    <div className="card p-5">
      <p className="font-display text-sm font-semibold mb-4 text-ink">Tren Lamaran — 14 Hari Terakhir</p>
      <div className="flex items-end gap-1 h-40">
        {counts.map((c) => (
          <div key={c.iso} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5" title={`${c.label}: ${c.count} lamaran`}>
            <div
              className="w-full max-w-[20px] bg-submitted rounded-t hover:opacity-75 transition-opacity"
              style={{ height: `${Math.max((c.count / max) * 100, c.count > 0 ? 6 : 2)}%`, minHeight: 3 }}
            />
            <span className="text-[9px] text-inkSoft whitespace-nowrap">{c.label.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusDonut({ applications }) {
  const total = applications.length;
  const order = ['Dilamar', 'Diproses', 'Interview', 'Diterima', 'Ditolak'];
  const counts = Object.fromEntries(order.map((s) => [s, applications.filter((a) => a.status === s).length]));

  return (
    <div className="card p-5">
      <p className="font-display text-sm font-semibold mb-4 text-ink">Distribusi Status</p>
      {total === 0 ? (
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
                const segs = order.map((s) => {
                  const pct = (counts[s] / total) * 100;
                  const seg = `${STATUS_META[s].color} ${acc}% ${acc + pct}%`;
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
            {order.map((s) => (
              <div key={s} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-inkSoft">
                  <span className="w-2 h-2 rounded-full" style={{ background: STATUS_META[s].color }} />
                  {STATUS_META[s].label}
                </span>
                <span className="font-mono font-semibold text-ink">{counts[s]}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Charts({ applications }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 mb-6">
      <div className="lg:col-span-2">
        <TrendChart applications={applications} />
      </div>
      <StatusDonut applications={applications} />
    </div>
  );
}
