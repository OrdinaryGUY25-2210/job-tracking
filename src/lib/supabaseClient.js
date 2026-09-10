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

/* ------------------------------------------------------------
   TRANSISI DARI LOGIN GOOGLE KE EMAIL/PASSWORD SUPABASE
   ------------------------------------------------------------
   Login utama sekarang email + password (native Supabase Auth).
   Integrasi Google (login & Calendar) sudah dihapus dari fitur.

   Flag ini HANYA untuk masa transisi: selama true, tombol "Masuk
   dengan Google (akun lama)" masih tampil di layar login supaya
   pengguna yang akunnya dulu dibuat via Google bisa login SEKALI LAGI
   dan men-setel password lewat banner yang muncul otomatis setelah
   login. Begitu semua pengguna sudah pindah, ubah ini jadi false lalu
   deploy ulang — lihat PANDUAN-TRANSISI-LOGIN.md. */
export const GOOGLE_LOGIN_TRANSITION_ENABLED = true;
