-- ============================================================
--  LACAK LAMARAN — Skema Supabase (Auth + Tabel Aplikasi)
-- ============================================================
--  Cara pakai:
--  1. Buka Supabase Dashboard > SQL Editor pada project-mu.
--  2. Tempel seluruh isi file ini, lalu jalankan (Run).
--  3. Aktifkan Google sebagai provider login di:
--     Authentication > Providers > Google
--     (isi Client ID & Client Secret dari Google Cloud Console).
--  4. Atur Site URL & Redirect URLs di:
--     Authentication > URL Configuration
--     agar sesuai dengan alamat tempat index.html di-hosting.
--  5. Salin Project URL & anon public key dari:
--     Project Settings > API, lalu tempel ke SUPABASE_URL dan
--     SUPABASE_ANON_KEY di dalam index.html.
--
--  Catatan: pengaturan provider Google TIDAK bisa dilakukan lewat
--  SQL — itu dikonfigurasi lewat dashboard seperti pada langkah 3.
-- ============================================================

-- Ekstensi untuk menghasilkan UUID (biasanya sudah aktif di Supabase)
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Tabel utama: applications
-- Menyimpan setiap lamaran pekerjaan milik seorang pengguna.
-- ------------------------------------------------------------
create table if not exists public.applications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  company       text not null,
  position      text not null,
  date_applied  date not null default current_date,
  status        text not null default 'Dilamar'
                  check (status in ('Dilamar', 'Diproses', 'Interview', 'Diterima', 'Ditolak')),
  link          text,
  notes         text,
  job_description text,
  cv_text         text,
  tailored_cv     text,
  cover_letter    text,
  interview_at    timestamptz,
  google_event_id text,
  source          text not null default 'manual' check (source in ('manual', 'ai')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Migrasi untuk database yang sudah ada dari versi sebelumnya
-- (aman dijalankan ulang / idempotent — abaikan error "already exists")
-- ------------------------------------------------------------
alter table public.applications add column if not exists job_description text;
alter table public.applications add column if not exists cv_text text;
alter table public.applications add column if not exists tailored_cv text;
alter table public.applications add column if not exists cover_letter text;
alter table public.applications add column if not exists interview_at timestamptz;
alter table public.applications add column if not exists google_event_id text;
alter table public.applications add column if not exists source text not null default 'manual';

alter table public.applications drop constraint if exists applications_status_check;
alter table public.applications add constraint applications_status_check
  check (status in ('Dilamar', 'Diproses', 'Interview', 'Diterima', 'Ditolak'));

alter table public.applications drop constraint if exists applications_source_check;
alter table public.applications add constraint applications_source_check
  check (source in ('manual', 'ai'));

alter table public.applications alter column status set default 'Dilamar';

-- Kolom tambahan: sumber lowongan (dari pencarian API), penanda perlu daftar
-- manual (tidak bisa dikirim via email), dan waktu terakhir email lamaran terkirim.
alter table public.applications add column if not exists job_url text;
alter table public.applications add column if not exists requires_manual_apply boolean not null default false;
alter table public.applications add column if not exists candidate_location text;
alter table public.applications add column if not exists emailed_at timestamptz;

-- Index untuk mempercepat query per pengguna & pengurutan tanggal
create index if not exists applications_user_id_idx on public.applications (user_id);
create index if not exists applications_date_applied_idx on public.applications (date_applied desc);

-- ------------------------------------------------------------
-- Tabel: profile
-- Data diri & portofolio terpusat (satu baris per pengguna), dipakai
-- sebagai sumber utama saat AI menyesuaikan CV — jadi tidak perlu upload
-- ulang file CV setiap kali melamar.
-- ------------------------------------------------------------
create table if not exists public.profile (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  tagline     text,
  contact     text,
  summary     text,
  skills      jsonb not null default '[]',
  experience  jsonb not null default '[]',
  projects    jsonb not null default '[]',
  education   jsonb not null default '[]',
  smtp_from_name text,
  updated_at  timestamptz not null default now()
);

drop trigger if exists profile_set_updated_at on public.profile;
create trigger profile_set_updated_at
  before update on public.profile
  for each row
  execute function public.set_updated_at();

alter table public.profile enable row level security;

drop policy if exists "Pengguna dapat melihat profil miliknya" on public.profile;
create policy "Pengguna dapat melihat profil miliknya"
  on public.profile for select using (auth.uid() = user_id);

drop policy if exists "Pengguna dapat menambah profil miliknya" on public.profile;
create policy "Pengguna dapat menambah profil miliknya"
  on public.profile for insert with check (auth.uid() = user_id);

drop policy if exists "Pengguna dapat mengubah profil miliknya" on public.profile;
create policy "Pengguna dapat mengubah profil miliknya"
  on public.profile for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Pengguna dapat menghapus profil miliknya" on public.profile;
create policy "Pengguna dapat menghapus profil miliknya"
  on public.profile for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Trigger: otomatis memperbarui kolom updated_at saat data diubah
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row
  execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security (RLS)
-- Setiap pengguna hanya boleh melihat & mengubah datanya sendiri.
-- ------------------------------------------------------------
alter table public.applications enable row level security;

drop policy if exists "Pengguna dapat melihat lamaran miliknya" on public.applications;
create policy "Pengguna dapat melihat lamaran miliknya"
  on public.applications
  for select
  using (auth.uid() = user_id);

drop policy if exists "Pengguna dapat menambah lamaran miliknya" on public.applications;
create policy "Pengguna dapat menambah lamaran miliknya"
  on public.applications
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Pengguna dapat mengubah lamaran miliknya" on public.applications;
create policy "Pengguna dapat mengubah lamaran miliknya"
  on public.applications
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Pengguna dapat menghapus lamaran miliknya" on public.applications;
create policy "Pengguna dapat menghapus lamaran miliknya"
  on public.applications
  for delete
  using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Tabel: interview_sessions & transcript_entries
-- Dipakai oleh fitur "Interview Assistant" (rekam interview, transkrip
-- live via AssemblyAI, saran jawaban AI via Claude). Ini murni PENAMBAHAN
-- tabel baru — tidak menyentuh tabel applications/profile yang sudah ada.
-- ------------------------------------------------------------
create table if not exists public.interview_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete set null,
  language   text default 'id',
  created_at timestamptz default now()
);

create table if not exists public.transcript_entries (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid references public.interview_sessions(id) on delete cascade,
  transcript_text  text not null,
  ai_response      text,
  created_at       timestamptz default now()
);

create index if not exists interview_sessions_user_id_idx on public.interview_sessions (user_id);
create index if not exists transcript_entries_session_id_idx on public.transcript_entries (session_id);

alter table public.interview_sessions enable row level security;
alter table public.transcript_entries enable row level security;

drop policy if exists "Pengguna dapat melihat sesi miliknya" on public.interview_sessions;
create policy "Pengguna dapat melihat sesi miliknya"
  on public.interview_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "Pengguna dapat menambah sesi miliknya" on public.interview_sessions;
create policy "Pengguna dapat menambah sesi miliknya"
  on public.interview_sessions for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Pengguna dapat melihat entri dari sesi miliknya" on public.transcript_entries;
create policy "Pengguna dapat melihat entri dari sesi miliknya"
  on public.transcript_entries for select
  using (
    session_id in (select id from public.interview_sessions where auth.uid() = user_id)
  );

drop policy if exists "Pengguna dapat menambah entri ke sesi miliknya" on public.transcript_entries;
create policy "Pengguna dapat menambah entri ke sesi miliknya"
  on public.transcript_entries for insert
  with check (
    session_id in (select id from public.interview_sessions where auth.uid() = user_id)
  );

-- ------------------------------------------------------------
-- Tabel: finance_accounts, finance_expenses, finance_targets
-- Dipakai oleh menu "Keuangan" — rekening bank/e-wallet (BCA, Mandiri,
-- BRI, DANA, dll) masing-masing dengan saldo sendiri, pelacakan
-- pengeluaran + analitik, dan target tabungan. Murni PENAMBAHAN tabel
-- baru — tidak menyentuh tabel yang sudah ada.
-- ------------------------------------------------------------
create table if not exists public.finance_accounts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  bank_name       text not null,
  account_number  text,
  account_holder  text,
  balance         numeric not null default 0,
  color           text default '#1F2A44',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists finance_accounts_set_updated_at on public.finance_accounts;
create trigger finance_accounts_set_updated_at
  before update on public.finance_accounts
  for each row
  execute function public.set_updated_at();

create table if not exists public.finance_expenses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  account_id    uuid references public.finance_accounts(id) on delete set null,
  category      text not null,
  amount        numeric not null,
  note          text,
  expense_date  date not null default current_date,
  created_at    timestamptz not null default now()
);

create table if not exists public.finance_targets (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name           text not null,
  target_amount  numeric not null,
  deadline       date,
  created_at     timestamptz not null default now()
);

create index if not exists finance_accounts_user_id_idx on public.finance_accounts (user_id);
create index if not exists finance_expenses_user_id_idx on public.finance_expenses (user_id);
create index if not exists finance_expenses_date_idx on public.finance_expenses (expense_date desc);
create index if not exists finance_targets_user_id_idx on public.finance_targets (user_id);

alter table public.finance_accounts enable row level security;
alter table public.finance_expenses enable row level security;
alter table public.finance_targets enable row level security;

drop policy if exists "Pengguna kelola rekening miliknya" on public.finance_accounts;
create policy "Pengguna kelola rekening miliknya"
  on public.finance_accounts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Pengguna kelola pengeluaran miliknya" on public.finance_expenses;
create policy "Pengguna kelola pengeluaran miliknya"
  on public.finance_expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Pengguna kelola target miliknya" on public.finance_targets;
create policy "Pengguna kelola target miliknya"
  on public.finance_targets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
--  Selesai. Tabel "applications", "profile", "interview_sessions",
--  "transcript_entries", "finance_accounts", "finance_expenses", dan
--  "finance_targets" siap dipakai oleh index.html melalui Supabase
--  Auth (Google) + Supabase JS client.
-- ============================================================
