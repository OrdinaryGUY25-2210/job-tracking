import { useState } from 'react';
import { searchJobs, stripHtml, timeAgo, SOURCE_BADGE_COLOR } from '../../lib/jobSearch';
import { IconTray } from '../icons/Icons';

export default function JobSearch({ onApplyWithAi }) {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState(null);
  const [failedSources, setFailedSources] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const runSearch = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { jobs: results, failedSources: failed } = await searchJobs(keyword.trim());
      if (results.length === 0) {
        setErrorMsg(`Gagal mengambil data lowongan${failed.length ? ' dari ' + failed.join(', ') : ''}. Coba lagi sebentar lagi.`);
        setJobs([]);
      } else {
        setJobs(results);
        setFailedSources(failed);
      }
    } catch {
      setErrorMsg('Terjadi kesalahan saat mencari lowongan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2.5 mb-2.5 flex-wrap">
        <div className="relative flex-1">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="6.5" cy="6.5" r="5" stroke="#5B6478" strokeWidth="1.4" />
            <path d="M10.5 10.5L14 14" stroke="#5B6478" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder="Kata kunci, mis. UI/UX Designer, Frontend..."
            className="w-full rounded-lg pl-9 pr-3 py-2.5 text-sm bg-surface border border-line text-ink"
          />
        </div>
        <button onClick={runSearch} className="btn-primary">
          Cari Lowongan
        </button>
      </div>
      <p className="text-xs text-inkSoft mb-5">
        Sumber (digabung):{' '}
        <a href="https://remotive.com" target="_blank" rel="noreferrer" className="text-submitted">
          Remotive
        </a>
        ,{' '}
        <a href="https://remoteok.com" target="_blank" rel="noreferrer" className="text-submitted">
          RemoteOK
        </a>
        ,{' '}
        <a href="https://arbeitnow.com" target="_blank" rel="noreferrer" className="text-submitted">
          Arbeitnow
        </a>{' '}
        — semua API publik gratis. Badge warna di tiap kartu menunjukkan sumbernya.
      </p>

      {loading && <div className="py-16 text-center text-sm text-inkSoft">Mencari lowongan dari 3 sumber...</div>}

      {!loading && errorMsg && <div className="text-[12.5px] bg-rejectedBg text-rejected p-3 rounded-lg">{errorMsg}</div>}

      {!loading && jobs && jobs.length === 0 && !errorMsg && (
        <div className="table-empty-state">
          <IconTray color="#5B6478" size={36} />
          <p>Tidak ada lowongan ditemukan. Coba kata kunci lain.</p>
        </div>
      )}

      {!loading && jobs && jobs.length > 0 && (
        <>
          {failedSources.length > 0 && (
            <p className="text-[11.5px] text-rejected mb-3">⚠ Gagal memuat dari: {failedSources.join(', ')} — hasil dari sumber lain tetap ditampilkan.</p>
          )}
          {jobs.map((j, i) => (
            <div key={i} className="card p-5 mb-3.5">
              <div className="flex justify-between gap-3 flex-wrap mb-2">
                <div>
                  <p className="text-[15px] font-semibold text-ink">{j.title || '-'}</p>
                  <p className="text-[13px] text-inkSoft mt-0.5">{j.company || '-'}</p>
                </div>
                <span className="text-[11px] text-inkSoft whitespace-nowrap text-right">
                  {timeAgo(j.dateISO)}
                  <br />
                  <span
                    className="inline-block mt-1 px-2.5 py-0.5 rounded-full border text-[11px]"
                    style={{ color: SOURCE_BADGE_COLOR[j.source], borderColor: SOURCE_BADGE_COLOR[j.source] + '55' }}
                  >
                    {j.source}
                  </span>
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap my-2.5">
                <span className="chip">🌍 {j.location || 'Remote'}</span>
                {j.type && <span className="chip">{j.type}</span>}
                {j.category && <span className="chip">{j.category}</span>}
              </div>
              <p className="text-[13px] text-inkSoft leading-relaxed mb-3.5">{stripHtml(j.description).slice(0, 220)}…</p>
              <div className="flex gap-2 flex-wrap">
                <a href={j.url} target="_blank" rel="noreferrer" className="text-[12.5px] font-semibold px-3.5 py-2 rounded-lg bg-paper text-ink border border-line hover:bg-lineSoft">
                  Lihat Lowongan ↗
                </a>
                <button
                  onClick={() =>
                    onApplyWithAi({
                      jobDescription: `${j.title} di ${j.company}\nLokasi: ${j.location || 'Remote'}\n\n${stripHtml(j.description)}`,
                      jobUrl: j.url,
                      candidateLocation: j.location || '',
                    })
                  }
                  className="text-[12.5px] font-semibold px-3.5 py-2 rounded-lg bg-interview text-white hover:opacity-90"
                >
                  ✨ Lamar dengan AI
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
