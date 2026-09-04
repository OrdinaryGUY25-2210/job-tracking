import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { fmtDateTime } from '../../lib/constants';
import { IconTray } from '../icons/Icons';

export default function SessionHistoryPanel() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('interview_sessions')
        .select('id, language, created_at, transcript_entries(count)')
        .order('created_at', { ascending: false })
        .limit(20);
      if (err) setError('Gagal memuat riwayat: ' + err.message);
      else setSessions(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="card mt-4">
      {loading ? (
        <div className="py-16 text-center text-sm text-inkSoft">Memuat riwayat...</div>
      ) : error ? (
        <div className="text-[12.5px] bg-rejectedBg text-rejected p-3 rounded-lg m-4">{error}</div>
      ) : sessions.length === 0 ? (
        <div className="table-empty-state">
          <IconTray color="#5B6478" size={30} />
          <p>Belum ada riwayat sesi.</p>
        </div>
      ) : (
        sessions.map((s) => (
          <div key={s.id} className="flex justify-between items-center px-4.5 py-3 border-b border-lineSoft last:border-0">
            <div>
              <p className="text-[13.5px] font-semibold text-ink">{fmtDateTime(s.created_at)}</p>
              <p className="text-xs text-inkSoft">
                {s.language === 'id' ? 'Bahasa Indonesia' : 'English'} · {s.transcript_entries?.[0]?.count || 0} entri transkrip
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
