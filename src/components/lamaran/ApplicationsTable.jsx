import { useMemo, useState } from 'react';
import { STATUS_META, fmtDate, fmtDateTime } from '../../lib/constants';
import { IconTray, IconCalendar } from '../icons/Icons';

const FILTERS = ['SEMUA', 'Dilamar', 'Diproses', 'Interview', 'Diterima', 'Ditolak'];

export default function ApplicationsTable({
  applications,
  loaded,
  onEdit,
  onDelete,
  onStatusChange,
  onSend,
  onAddFirst,
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('SEMUA');

  const filtered = useMemo(() => {
    return applications
      .filter((a) => (filter === 'SEMUA' ? true : a.status === filter))
      .filter((a) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return a.company.toLowerCase().includes(q) || a.position.toLowerCase().includes(q);
      })
      .sort((a, b) => (a.date_applied < b.date_applied ? 1 : -1));
  }, [applications, filter, search]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
        <div className="relative flex-1 min-w-[200px]">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="6.5" cy="6.5" r="5" stroke="#5B6478" strokeWidth="1.4" />
            <path d="M10.5 10.5L14 14" stroke="#5B6478" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari perusahaan atau posisi..."
            className="w-full rounded-lg pl-9 pr-3 py-2.5 text-sm bg-surface border border-line text-ink"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`chip ${filter === f ? 'active' : ''}`}>
              {f === 'SEMUA' ? 'Semua' : STATUS_META[f].label}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {!loaded ? (
          <div className="py-16 text-center text-sm text-inkSoft">Memuat data...</div>
        ) : filtered.length === 0 ? (
          <div className="table-empty-state">
            <IconTray color="#5B6478" size={36} />
            <p>{applications.length === 0 ? 'Belum ada lamaran tercatat.' : 'Tidak ada hasil yang cocok.'}</p>
            {applications.length === 0 && (
              <button onClick={onAddFirst} className="text-sm font-semibold underline underline-offset-2 text-ink">
                Tambah lamaran pertama
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[620px]">
              <thead>
                <tr className="border-b border-line">
                  {['Perusahaan', 'Posisi', 'Tanggal', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-4.5 py-3 text-xs font-medium text-inkSoft">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-lineSoft last:border-0">
                    <td className="px-4.5 py-3.5 font-medium">
                      <div className="flex items-center gap-1.5">
                        {a.company}
                        {a.link && (
                          <a href={a.link} target="_blank" rel="noreferrer" className="opacity-50 hover:opacity-90 flex">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M5 2h5v5M10 2 5 7M9 7v2.5A1.5 1.5 0 0 1 7.5 11h-5A1.5 1.5 0 0 1 1 9.5v-5A1.5 1.5 0 0 1 2.5 3H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4.5 py-3.5 text-inkSoft">{a.position}</td>
                    <td className="px-4.5 py-3.5 text-inkSoft font-mono text-[12.5px]">{fmtDate(a.date_applied)}</td>
                    <td className="px-4.5 py-3.5">
                      <select
                        value={a.status}
                        onChange={(e) => onStatusChange(a, e.target.value)}
                        className="status-badge appearance-none pl-3 pr-6 py-1.5 border cursor-pointer"
                        style={{
                          background: STATUS_META[a.status].bg,
                          color: STATUS_META[a.status].color,
                          borderColor: STATUS_META[a.status].color + '33',
                          backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%235B6478' stroke-width='1.4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 10px center',
                        }}
                      >
                        {Object.entries(STATUS_META).map(([val, m]) => (
                          <option key={val} value={val}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                      {a.status === 'Interview' && a.interview_at && (
                        <div className="mt-1 inline-flex items-center gap-1 text-[11.5px] px-2 py-0.5 rounded-full text-interview bg-interviewBg">
                          <IconCalendar size={12} color="#6B5FA3" /> {fmtDateTime(a.interview_at)}
                        </div>
                      )}
                      {a.requires_manual_apply && (
                        <div className="mt-1 inline-flex items-center gap-1 text-[11.5px] px-2 py-0.5 rounded-full text-rejected bg-rejectedBg">
                          ⚠ Daftar manual
                        </div>
                      )}
                      {a.emailed_at && (
                        <div className="mt-1 inline-flex items-center gap-1 text-[11.5px] px-2 py-0.5 rounded-full text-accepted bg-acceptedBg">
                          ✓ Email terkirim
                        </div>
                      )}
                    </td>
                    <td className="px-4.5 py-3.5">
                      <div className="flex justify-end gap-1">
                        {a.tailored_cv && (
                          <button onClick={() => onSend(a)} className="p-1.5 rounded-lg hover:bg-black/5" title="Kirim via Email">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path d="M2 3.5h12v9H2v-9Z" stroke="#5B6478" strokeWidth="1.3" strokeLinejoin="round" />
                              <path d="M2.5 4l5.5 4.2L13.5 4" stroke="#5B6478" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        )}
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
            </table>
          </div>
        )}
      </div>
    </>
  );
}
