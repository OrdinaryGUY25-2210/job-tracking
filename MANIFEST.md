# Manifest Update — Chart caPOS + Perbaikan Layout

## ⚠️ PALING PENTING — penyebab error build kamu

**`package.json` dan `package-lock.json` HARUS ikut ditimpa.** Error
`Rollup failed to resolve import "recharts"` terjadi karena kedua file ini
belum ikut ter-update di repo kamu — `CaposApp.jsx` sudah `import` dari
`recharts`, tapi Vercel tidak tahu harus install library itu karena tidak
terdaftar di `package.json`. Timpa **kedua file ini**, jangan cuma file
`.jsx`-nya saja.

## Semua file di zip ini

| Lokasi | Kenapa berubah |
|---|---|
| `package.json` | Tambah dependency `recharts` (chart library) |
| `package-lock.json` | Ikut update — dibutuhkan `npm ci` di Vercel supaya versi persis sama |
| `vite.config.js` | Split bundle besar (`recharts`, `pdfjs-dist`, `docx`+`mammoth`) jadi chunk terpisah + naikkan batas cache PWA |
| `src/lib/capos.js` | Tambah fungsi `buildSignupTrend` untuk data grafik trafik |
| `src/components/capos/CaposApp.jsx` | Tambah Bar Chart (perbandingan tier) + Area Chart (trafik pendaftaran 14 hari) |
| `src/index.css` | **Definisikan `.app-section`** (sebelumnya tidak ada!) — bikin semua halaman lebar 90%, tidak mepet kiri-kanan |
| `src/components/Topbar.jsx` | Selaraskan lebar navbar dengan 90% yang sama |
| `src/components/lamaran/LamaranApp.jsx` | Header dipisah: judul di kiri, tombol aksi di kanan |

## Setelah copy-timpa

1. Commit & push semua 8 file ini.
2. Redeploy di Vercel (biasanya otomatis kalau sudah terhubung ke Git).
3. Kalau masih error `recharts`/`lucide-react` not resolved lagi setelah ini, kemungkinan besar `package.json` yang ke-push ke repo masih bukan yang dari zip ini — cek isi file itu langsung di GitHub, pastikan ada baris `"recharts"` di dalamnya.
