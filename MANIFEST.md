# Manifest File Update — Cortex

Isi zip ini **hanya** file yang baru dibuat atau diubah sepanjang percakapan ini (bukan seluruh project).
Struktur folder di dalam zip ini **sama persis** dengan struktur project-mu — tinggal copy-timpa (overwrite)
ke lokasi yang sama di project aslimu.

## Cara pakai
1. Ekstrak zip ini.
2. Copy seluruh isinya ke root folder project `job-tracking-main` kamu, timpa file yang sudah ada.
3. Hapus manual 1 file basi yang **tidak** ada di zip ini (lihat bagian "Perlu dihapus manual" di bawah).
4. Jalankan bagian baru di `supabase/schema.sql` (lihat bawah) di SQL Editor Supabase.
5. Commit & push → Vercel redeploy otomatis.

---

## File BARU (belum ada sebelumnya)

| Lokasi | Isi |
|---|---|
| `public/favicon-32.png` | Favicon 32×32 dari logo Cortex |
| `src/assets/logo.png` | Logo Cortex versi 128×128 (untuk dipakai di dalam UI kalau perlu) |
| `src/components/Topbar.jsx` | Navbar atas: logo, hamburger, install button, bel notifikasi, menu akun |
| `src/components/AccountMenu.jsx` | Dropdown akun (avatar, nama, email, badge paket, tombol Keluar) |
| `src/components/NotificationBell.jsx` | Bel notifikasi + dropdown daftar notifikasi |
| `src/components/finance/AllocationApp.jsx` | Fitur "Alokasi Pengeluaran" (Berapa yang Boleh Dipakai?) |
| `src/hooks/useAccount.js` | Ambil data akun (nama, tier, is_admin) dari tabel `profiles` |
| `src/hooks/useNotifications.js` | Ambil & kelola notifikasi (realtime, tandai dibaca) |
| `src/hooks/useAllocation.js` | Logika fitur Alokasi Pengeluaran (load/simpan/reset) |

## File DIUBAH (sudah ada, isinya diganti)

| Lokasi | Perubahan |
|---|---|
| `index.html` | Judul → "Cortex", favicon & apple-touch-icon baru |
| `vite.config.js` | Manifest PWA: nama app → "Cortex" |
| `package.json` | Nama project → "cortex", tambah dependency `lucide-react` |
| `package-lock.json` | Ikut update karena `lucide-react` ditambahkan (penting untuk `npm ci` di Vercel) |
| `public/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` | Diganti pakai logo yang kamu kirim |
| `src/App.jsx` | Ditulis ulang: Topbar + Sidebar disatukan dengan benar, props `userId`/`showToast`/`profile` dioper ke `LamaranApp`/`FinanceApp`, props `onSignIn` dkk dioper ke `Login`, gating admin untuk tab caPOS |
| `src/components/Login.jsx` | Logo & nama app → Cortex |
| `src/components/Sidebar.jsx` | Tambah logo Cortex di header sidebar, item menu "caPOS Analytics" (khusus admin) |
| `src/components/finance/ConfirmModal.jsx` | Tambah prop `confirmLabel` (dipakai untuk tombol "Reset" di Alokasi Pengeluaran) |
| `src/components/finance/FinanceApp.jsx` | Tambah tab "Alokasi Pengeluaran" |
| `supabase/schema.sql` | Tambah tabel `notifications`, `finance_allocations`, `finance_allocation_items` + perbaikan urutan fungsi & `alter table` pengaman untuk `profiles` |

## Perlu dihapus manual (tidak ada gantinya di zip ini)

- **`Sidebar.jsx` di root folder project** (bukan yang di `src/components/`) — ini file duplikat nyasar yang tidak pernah dipakai kode manapun, aman dihapus.

## Bagian schema.sql yang perlu dijalankan

Kalau kamu sudah pernah menjalankan `schema.sql` versi sebelumnya, **jalankan ulang seluruh file dari atas sampai bawah** (aman, semua statement idempotent) — supaya semua perbaikan urutan fungsi dan `alter table` pengaman ikut ter-apply, tidak cuma bagian yang kelihatan baru.
