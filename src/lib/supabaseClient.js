import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey || url.includes('YOUR-PROJECT-REF')) {
  // Tidak melempar error keras supaya app tetap bisa dibuka dan menampilkan
  // pesan yang jelas, bukan layar putih kosong.
  console.warn(
    'Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env (lihat .env.example).'
  );
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder');

// Scope tambahan agar Supabase Auth meminta izin akses Google Calendar
// saat login (dipakai untuk membuat event interview otomatis).
export const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.events';
