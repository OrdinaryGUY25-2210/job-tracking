import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { fmtDateTime } from '../../lib/constants';
import { IconCalendar } from '../icons/Icons';

async function addToGoogleCalendar(app, interviewISO, notes) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const providerToken = session?.provider_token;
  if (!providerToken) {
    return { ok: false, message: 'Izin Google Calendar tidak ditemukan — logout lalu login ulang agar diminta izin akses kalender.' };
  }
  const start = new Date(interviewISO);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const event = {
    summary: `Interview: ${app.position} - ${app.company}`,
    description: notes || `Interview untuk posisi ${app.position} di ${app.company}.`,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
  };
  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${providerToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return { ok: false, message: 'Gagal menambah ke Calendar: ' + (errBody?.error?.message || res.status) };
    }
    const created = await res.json();
    return { ok: true, eventId: created.id };
  } catch {
    return { ok: false, message: 'Gagal menghubungi Google Calendar.' };
  }
}

export default function InterviewScheduleModal({ app, onCancel, onSaved, showToast }) {
  const base = app.interview_at ? new Date(app.interview_at) : new Date(Date.now() + 24 * 3600 * 1000);
  const [date, setDate] = useState(base.toISOString().slice(0, 10));
  const [time, setTime] = useState(`${String(base.getHours()).padStart(2, '0')}:${String(base.getMinutes()).padStart(2, '0')}`);
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (addCalendar) => {
    if (!date) {
      setMsg('Pilih tanggal dulu.');
      return;
    }
    setSaving(true);
    const interviewISO = new Date(`${date}T${time || '09:00'}:00`).toISOString();
    let googleEventId = app.google_event_id || null;

    if (addCalendar) {
      setMsg('Menambahkan ke Google Calendar...');
      const result = await addToGoogleCalendar(app, interviewISO, notes);
      if (result.ok) {
        googleEventId = result.eventId;
        setMsg('Berhasil ditambahkan ke Google Calendar.');
      } else {
        setMsg(result.message + ' (status tetap disimpan tanpa event kalender)');
      }
    }

    const updated = await onSaved({
      status: 'Interview',
      interview_at: interviewISO,
      notes: notes || app.notes,
      google_event_id: googleEventId,
    });
    setSaving(false);
    if (updated) {
      showToast('interview', 'Interview dijadwalkan', `${app.company} — ${fmtDateTime(interviewISO)}`);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-ink">Jadwalkan Interview</h2>
          <button onClick={onCancel} className="opacity-40 hover:opacity-80">
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
        <p className="text-xs text-inkSoft min-h-[16px] mb-1">{msg}</p>
        <div className="flex gap-2.5">
          <button onClick={onCancel} className="flex-1 rounded-lg py-2.5 text-sm font-medium bg-paper text-inkSoft">
            Batal
          </button>
          <button disabled={saving} onClick={() => submit(false)} className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-paper text-ink disabled:opacity-50">
            Simpan Saja
          </button>
        </div>
        <button disabled={saving} onClick={() => submit(true)} className="btn-ai mt-2">
          <IconCalendar color="#fff" size={16} /> Simpan & Tambah ke Google Calendar
        </button>
      </div>
    </div>
  );
}
