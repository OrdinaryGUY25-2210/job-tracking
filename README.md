# Lacak Lamaran + Interview Assistant

Aplikasi pelacak lamaran kerja dengan AI CV Tailor, pencarian lowongan, dan asisten
interview real-time — dibangun dengan React + Vite, siap deploy ke Vercel.

## Struktur Proyek

```
src/
├── components/
│   ├── lamaran/          # Dashboard, Cari Lowongan, Profil, semua modal
│   ├── interview/        # Interview Assistant (rekam, transkrip, saran AI)
│   ├── finance/           # Keuangan: rekening, pengeluaran, analitik, target
│   ├── icons/             # Ikon SVG flat 2D
│   ├── Login.jsx
│   ├── Sidebar.jsx        # Menu overlay kiri
│   └── ToastContainer.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useApplications.js
│   ├── useLiveTranscription.js
│   └── useToast.js
├── lib/
│   ├── supabaseClient.js
│   ├── constants.js
│   ├── docxBuilder.js     # Generator CV/cover letter .docx
│   ├── cvExtract.js       # Ekstrak teks dari .pdf/.docx/.txt
│   └── jobSearch.js       # Gabungan 3 API lowongan gratis
├── App.jsx
└── main.jsx
supabase/
├── functions/              # 6 Edge Function (Deno) — deploy lewat dashboard Supabase
└── schema.sql               # Skema database lengkap
```

## 1. Jalankan secara lokal

```bash
npm install
cp .env.example .env
```

Isi `.env`:
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxx
```
Ambil dari Supabase Dashboard → Project Settings → API.

```bash
npm run dev
```
Buka `http://localhost:5173`.

## 2. Setup Supabase

1. Jalankan seluruh isi `supabase/schema.sql` di **SQL Editor** dashboard Supabase.
   (Termasuk tabel `finance_accounts`, `finance_expenses`, `finance_targets` untuk menu
   Keuangan — tidak butuh secret/API key tambahan apa pun.)
2. Deploy 6 Edge Function di `supabase/functions/` lewat **Edge Functions → Deploy a new
   function → Via Editor** (nama function harus persis sama dengan nama foldernya):
   - `tailor-cv`, `parse-profile` — AI Tailor CV & scan profil (pakai OpenRouter/Groq)
   - `send-application` — kirim email lamaran via SMTP
   - `daily-digest` — ringkasan harian (opsional, perlu Cron Job)
   - `generate-token`, `get-ai-response` — Interview Assistant (AssemblyAI + Claude)
3. Set secrets sesuai kebutuhan fitur yang dipakai — daftar lengkap tiap secret ada di
   komentar bagian atas masing-masing file function.
4. Aktifkan Google sebagai provider login di **Authentication → Providers → Google**.

## 3. Deploy ke Vercel

1. Push project ini ke repo GitHub.
2. Buka **vercel.com** → **Add New Project** → import repo tersebut.
3. Vercel otomatis mendeteksi ini project Vite — build command & output directory
   default (`vite build` / `dist`) sudah benar, tidak perlu diubah.
4. Di bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Klik **Deploy**.
6. **Penting**: setelah dapat URL Vercel (mis. `https://nama-app.vercel.app`), tambahkan
   URL itu ke:
   - **Google Cloud Console** → OAuth Client → Authorized JavaScript origins & Authorized
     redirect URIs (redirect URI tetap mengarah ke callback Supabase, origin yang baru
     ditambahkan)
   - **Supabase Dashboard** → Authentication → URL Configuration → Site URL & Redirect URLs

## Catatan

- Edge Functions (folder `supabase/functions/`) **tidak ikut ter-deploy otomatis** oleh
  Vercel — itu berjalan di infrastruktur Supabase sendiri, dideploy terpisah lewat
  dashboard Supabase (langkah 2 di atas).
- File `.env` tidak pernah ikut ter-commit ke git (sudah ada di `.gitignore`) — isi
  environment variable production diatur lewat dashboard Vercel, bukan file `.env`.
