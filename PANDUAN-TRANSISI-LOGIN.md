# Panduan Transisi: Login Google → Email/Password Supabase

Aplikasi ini sekarang login-nya **email + password langsung dari Supabase Auth**, bukan
lagi lewat Google. Integrasi Google Calendar di fitur jadwal interview juga sudah dihapus
sepenuhnya (tidak ada lagi panggilan ke API Google di kode).

**Kenapa harus hati-hati saat pindah?** Karena setiap baris data kamu (lamaran, profil,
keuangan, sesi interview) di database terikat ke satu ID akun (`user_id`), dan ID itu
ditentukan dari cara kamu login. Kalau kamu langsung berhenti pakai Google dan bikin akun
baru dari nol pakai email/password, akun barunya punya ID yang **beda** — semua data
lamamu jadi seperti hilang (sebenarnya tidak hilang, cuma tidak kelihatan karena RLS
memfilter berdasarkan ID akun).

Supaya ini tidak terjadi, ikuti urutan di bawah **persis sesuai nomornya**.

---

## Langkah 1 — Deploy versi ini dulu (Google masih aktif sementara)

Versi kode yang saya berikan **sengaja belum menghapus tombol Google sepenuhnya**. Ada
tombol kecil "Masuk dengan Google (akun lama)" di layar login, khusus untuk transisi.
Deploy dulu versi ini seperti biasa (lihat README.md).

## Langkah 2 — Login sekali lagi pakai Google, lalu setel password

1. Buka aplikasi yang sudah di-deploy.
2. Klik **"Masuk dengan Google (akun lama)"**.
3. Setelah masuk, akan muncul **banner ungu** di bagian atas: *"Akunmu masih pakai login
   Google"*.
4. Klik **Setel Password**, isi password baru (min. 6 karakter), simpan.

Di balik layar, ini memanggil `supabase.auth.updateUser({ password })` — artinya password
baru **ditambahkan ke akun Google kamu yang sudah ada**, bukan membuat akun baru. ID
akunmu (dan semua data yang terhubung ke ID itu) tetap sama persis.

## Langkah 3 — Uji login dengan email + password

1. Klik **Keluar**.
2. Di layar login, isi form utama (bukan tombol Google) dengan email yang sama seperti
   akun Google-mu, dan password yang baru saja kamu setel.
3. Klik **Masuk**.
4. Pastikan semua data lamaran/keuangan/profil kamu **masih ada** seperti sebelumnya.

Kalau langkah ini berhasil, migrasimu selesai — akun sama, data sama, cuma cara masuknya
yang berubah.

## Langkah 4 — (Kalau ada banyak pengguna lain) ulangi untuk semua akun

Kalau aplikasi ini dipakai lebih dari satu orang, setiap orang perlu melakukan Langkah 2
dan 3 sendiri-sendiri (kamu tidak bisa melakukannya untuk mereka).

## Langkah 5 — Setelah SEMUA akun sudah migrasi, matikan tombol Google

Buka `src/lib/supabaseClient.js`, cari baris:
```js
export const GOOGLE_LOGIN_TRANSITION_ENABLED = true;
```
Ubah jadi:
```js
export const GOOGLE_LOGIN_TRANSITION_ENABLED = false;
```
Commit, push, deploy ulang. Tombol "Masuk dengan Google" akan otomatis hilang dari layar
login (kodenya sudah membaca flag ini).

## Langkah 6 — (Opsional) Nonaktifkan provider Google di Supabase

Kalau mau lebih rapi, di **Supabase Dashboard → Authentication → Sign In / Providers →
Google**, matikan toggle **Enable Sign in with Google**. Ini opsional — kalau di Langkah 5
tombolnya sudah dihapus dari UI, provider yang masih aktif di backend tidak berpengaruh ke
pengguna, tapi mematikannya sepenuhnya membersihkan setup.

---

## Kalau ada pengguna yang terlanjur lupa/terlewat sebelum Langkah 5

Kalau kamu sudah menghapus tombol Google (Langkah 5) tapi ternyata ada akun yang **belum
sempat** setel password di Langkah 2 — akun itu akan terkunci (tidak bisa login lewat
Google lagi karena tombolnya hilang, dan belum punya password). Cara pulihkan:

1. Kembalikan dulu `GOOGLE_LOGIN_TRANSITION_ENABLED` ke `true`, deploy ulang.
2. Minta pengguna itu login sekali lagi via Google, lalu ulangi Langkah 2–3.
3. Setelah semua benar-benar migrasi, baru ulangi Langkah 5.

**Intinya: jangan pernah matikan tombol Google sebelum kamu benar-benar konfirmasi bisa
login dengan email+password terlebih dahulu.**

---

## Soal fitur yang hilang: Google Calendar di jadwal interview

Fitur "+ Tambah ke Google Calendar" saat menjadwalkan interview sudah dihapus total dari
kode (bukan cuma disembunyikan) — karena bergantung pada `provider_token` yang hanya ada
kalau login pakai Google OAuth. Sekarang fitur "Jadwalkan Interview" hanya menyimpan
tanggal/jam/catatan ke database aplikasi sendiri, tanpa terhubung ke kalender eksternal
mana pun.

Kalau nanti kamu ingin fitur reminder kalender kembali, opsinya:
- Ekspor jadwal sebagai file `.ics` (format kalender universal, bisa diimpor manual ke
  Google Calendar/Outlook/Apple Calendar tanpa perlu OAuth) — ini bisa ditambahkan tanpa
  membawa balik ketergantungan ke akun Google untuk login.
- Kirim reminder lewat email (menggunakan Edge Function `send-application` yang sudah
  ada, dengan sedikit modifikasi).
