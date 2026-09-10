import { useState } from 'react';
import { fmtDateTime } from '../../lib/constants';

export default function InterviewScheduleModal({ app, onCancel, onSaved, showToast }) {
  const base = app.interview_at ? new Date(app.interview_at) : new Date(Date.now() + 24 * 3600 * 1000);
  const [date, setDate] = useState(base.toISOString().slice(0, 10));
  const [time, setTime] = useState(`${String(base.getHours()).padStart(2, '0')}:${String(base.getMinutes()).padStart(2, '0')}`);
  const [notes, setNotes] = useState(app.notes || '');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!date) {
      setMsg('Pilih tanggal dulu.');
      return;
    }
    setSaving(true);
    const interviewISO = new Date(`${date}T${time || '09:00'}:00`).toISOString();

    const updated = await onSaved({
      status: 'Interview',
      interview_at: interviewISO,
      notes: notes || app.notes,
    });
    setSaving(false);
    if (updated) {
      showToast('interview', 'Interview dijadwalkan', `${app.company} — ${fmtDateTime(interviewISO)}`);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <form onSubmit={submit} className="modal-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-ink">Jadwalkan Interview</h2>
          <button type="button" onClick={onCancel} className="opacity-40 hover:opacity-80">
            ✕
          </button>
        </div>
        <p className="text-[13px] text-inkSoft mb-3.5">
          {app.position} di {app.company}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="field">
            <label>Tanggal</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Jam</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Catatan (opsional)</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Lokasi / link video call" />
        </div>
        {msg && <p className="text-xs text-rejected mb-2">{msg}</p>}
        <div className="flex gap-2.5 mt-2">
          <button type="button" onClick={onCancel} className="flex-1 rounded-lg py-2.5 text-sm font-medium bg-paper text-inkSoft">
            Batal
          </button>
          <button type="submit" disabled={saving} className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-ink text-white disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </div>
      </form>
    </div>
  );
}
