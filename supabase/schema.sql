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
--  Alokasi Pengeluaran ("Berapa yang Boleh Dipakai?")
--  Satu baris "finance_allocations" per user (total penghasilan),
--  banyak baris "finance_allocation_items" (kategori + persentase).
--  Beda dari "finance_targets": ini kalkulator alokasi berbasis
--  persentase penghasilan, bukan target tabungan per item.
-- ============================================================
create table if not exists public.finance_allocations (
  user_id         uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  total_income    numeric not null default 0,
  active_template text not null default 'custom'
                    check (active_template in ('50-30-20', '40-30-20-10', 'custom')),
  updated_at      timestamptz not null default now()
);

drop trigger if exists finance_allocations_set_updated_at on public.finance_allocations;
create trigger finance_allocations_set_updated_at
  before update on public.finance_allocations
  for each row
  execute function public.set_updated_at();

create table if not exists public.finance_allocation_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category_name text not null,
  percentage    numeric(5,2) not null default 0 check (percentage >= 0),
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists finance_allocation_items_user_id_idx on public.finance_allocation_items (user_id, sort_order);

alter table public.finance_allocations enable row level security;
alter table public.finance_allocation_items enable row level security;

drop policy if exists "Pengguna kelola alokasi miliknya" on public.finance_allocations;
create policy "Pengguna kelola alokasi miliknya"
  on public.finance_allocations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Pengguna kelola kategori alokasi miliknya" on public.finance_allocation_items;
create policy "Pengguna kelola kategori alokasi miliknya"
  on public.finance_allocation_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
--  caPOS — Tracking pelanggan, tier/plan langganan & pendapatan
--  Dipakai oleh dashboard admin di src/components/capos/CaposApp.jsx
--  (lewat src/lib/capos.js & src/hooks/useCapos.js). Murni PENAMBAHAN
--  tabel baru — tidak menyentuh tabel yang sudah ada.
--
--  Catatan penting: tabel "profiles" (jamak) di bawah ini BEDA dari
--  tabel "profile" (tunggal) yang sudah ada di atas. "profile" berisi
--  data CV/portofolio pengguna untuk fitur pelamaran; "profiles" di
--  sini berisi data akun & status langganan tiap pengguna, dipakai
--  khusus untuk dashboard analitik caPOS.
-- ============================================================

-- Didefinisikan ulang (create or replace, aman walau sudah ada) di sini
-- juga, supaya section caPOS ini bisa dijalankan sendirian di SQL Editor
-- tanpa harus run seluruh schema.sql dari atas dulu.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Tabel: profiles
-- Satu baris per pengguna, otomatis dibuat saat user mendaftar
-- (lihat trigger on_auth_user_created_profile di bawah).
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  full_name          text,
  email              text,
  subscription_tier  text not null default 'free'
                        check (subscription_tier in ('free', 'pro', 'supreme')),
  status             text not null default 'aktif'
                        check (status in ('aktif', 'nonaktif', 'suspended')),
  is_admin           boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists profiles_subscription_tier_idx on public.profiles (subscription_tier);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Otomatis buat baris "profiles" tiap kali ada user baru mendaftar lewat
-- Supabase Auth, supaya dashboard caPOS selalu punya data lengkap tanpa
-- langkah manual apa pun.
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

-- Backfill: isi "profiles" untuk user yang sudah terdaftar sebelum
-- migrasi ini dijalankan (aman dijalankan berkali-kali).
insert into public.profiles (id, full_name, email)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  u.email
from auth.users u
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Tabel: capos_activity_logs
-- Log aktivitas pelanggan (upgrade/downgrade tier, dll) — dipakai
-- untuk panel "Aktivitas Pengguna Terkini" di dashboard caPOS.
-- ------------------------------------------------------------
create table if not exists public.capos_activity_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade,
  full_name    text,
  email        text,
  action_type  text not null default 'other'
                 check (action_type in ('signup', 'upgrade', 'downgrade', 'cancel', 'other')),
  description  text,
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists capos_activity_logs_created_at_idx on public.capos_activity_logs (created_at desc);
create index if not exists capos_activity_logs_is_read_idx on public.capos_activity_logs (is_read);

-- Otomatis catat log tiap kali subscription_tier pengguna berubah,
-- supaya histori upgrade/downgrade tidak perlu dicatat manual.
create or replace function public.log_capos_tier_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text;
  v_rank_old int;
  v_rank_new int;
begin
  if new.subscription_tier = old.subscription_tier then
    return new;
  end if;

  v_rank_old := case old.subscription_tier when 'free' then 0 when 'pro' then 1 when 'supreme' then 2 end;
  v_rank_new := case new.subscription_tier when 'free' then 0 when 'pro' then 1 when 'supreme' then 2 end;
  v_action := case when v_rank_new > v_rank_old then 'upgrade' else 'downgrade' end;

  insert into public.capos_activity_logs (user_id, full_name, email, action_type, description)
  values (
    new.id, new.full_name, new.email, v_action,
    format('Berpindah dari tier %s ke %s', initcap(old.subscription_tier), initcap(new.subscription_tier))
  );

  return new;
end;
$$;

drop trigger if exists profiles_log_tier_change on public.profiles;
create trigger profiles_log_tier_change
  after update of subscription_tier on public.profiles
  for each row
  execute function public.log_capos_tier_change();

-- Otomatis catat log tiap kali ada pengguna baru mendaftar.
create or replace function public.log_capos_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.capos_activity_logs (user_id, full_name, email, action_type, description)
  values (new.id, new.full_name, new.email, 'signup', 'Mendaftar sebagai pengguna baru (Free tier)');
  return new;
end;
$$;

drop trigger if exists profiles_log_signup on public.profiles;
create trigger profiles_log_signup
  after insert on public.profiles
  for each row
  execute function public.log_capos_signup();

-- ------------------------------------------------------------
-- Row Level Security
-- Tabel ini berisi data seluruh pelanggan (email, tier, histori) —
-- hanya admin yang boleh melihat semuanya lewat dashboard caPOS.
-- Pengguna biasa hanya boleh melihat & mengubah data namanya sendiri;
-- kolom tier & is_admin tidak boleh diubah dari client sama sekali
-- (lihat trigger protect_profile_privileged_columns di bawah) — ubah
-- tier hanya lewat Edge Function admin / webhook payment gateway yang
-- memakai service role key.
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.capos_activity_logs enable row level security;

-- Helper: cek apakah user yang sedang login adalah admin.
-- security definer + search_path tetap supaya tidak kena rekursi RLS.
create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

drop policy if exists "Pengguna lihat profil sendiri, admin lihat semua" on public.profiles;
create policy "Pengguna lihat profil sendiri, admin lihat semua"
  on public.profiles for select
  using (auth.uid() = id or public.is_current_user_admin());

drop policy if exists "Pengguna ubah profil sendiri" on public.profiles;
create policy "Pengguna ubah profil sendiri"
  on public.profiles for update
  using (auth.uid() = id or public.is_current_user_admin())
  with check (auth.uid() = id or public.is_current_user_admin());

-- Kunci kolom sensitif (subscription_tier, is_admin, status) supaya
-- pengguna biasa tidak bisa menaikkan tier / jadi admin sendiri lewat
-- client, walau lolos policy UPDATE di atas.
create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_current_user_admin() then
    return new;
  end if;

  new.subscription_tier := old.subscription_tier;
  new.is_admin := old.is_admin;
  new.status := old.status;
  return new;
end;
$$;

drop trigger if exists profiles_protect_privileged_columns on public.profiles;
create trigger profiles_protect_privileged_columns
  before update on public.profiles
  for each row
  execute function public.protect_profile_privileged_columns();

drop policy if exists "Hanya admin lihat log aktivitas" on public.capos_activity_logs;
create policy "Hanya admin lihat log aktivitas"
  on public.capos_activity_logs for select
  using (public.is_current_user_admin());

drop policy if exists "Hanya admin ubah status baca log" on public.capos_activity_logs;
create policy "Hanya admin ubah status baca log"
  on public.capos_activity_logs for update
  using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

-- ------------------------------------------------------------
-- Jadikan dirimu admin pertama supaya bisa membuka dashboard caPOS.
-- Jalankan SATU KALI setelah migrasi ini, ganti email di bawah
-- dengan email akun Google/emailmu sendiri, lalu hapus baris ini.
-- ------------------------------------------------------------
-- update public.profiles set is_admin = true where email = 'emailkamu@gmail.com';

-- ============================================================
--  notifications — notifikasi per-pengguna (bel di navbar)
--  Beda dari "capos_activity_logs" (khusus admin, lihat semua orang):
--  tabel ini per-user, tiap orang cuma lihat notifikasinya sendiri.
-- ============================================================
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  message      text,
  type         text not null default 'info'
                 check (type in ('info', 'success', 'warning')),
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists notifications_user_id_created_at_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_user_id_unread_idx on public.notifications (user_id) where is_read = false;

alter table public.notifications enable row level security;

drop policy if exists "Pengguna kelola notifikasi miliknya" on public.notifications;
create policy "Pengguna kelola notifikasi miliknya"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Otomatis kirim notifikasi tiap kali status lamaran berubah.
create or replace function public.notify_application_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  insert into public.notifications (user_id, title, message, type)
  values (
    new.user_id,
    format('Lamaran di %s diperbarui', new.company),
    format('Status lamaran untuk posisi "%s" di %s berubah jadi %s.', new.position, new.company, initcap(new.status)),
    case when new.status in ('offer', 'accepted') then 'success'
         when new.status = 'rejected' then 'warning'
         else 'info' end
  );
  return new;
end;
$$;

drop trigger if exists applications_notify_status_change on public.applications;
create trigger applications_notify_status_change
  after update of status on public.applications
  for each row
  execute function public.notify_application_status_change();

-- Sambutan otomatis untuk pengguna baru.
create or replace function public.notify_welcome()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, title, message, type)
  values (new.id, 'Selamat datang di Cortex 👋', 'Yuk mulai catat lamaran pertamamu dan lengkapi profil.', 'success');
  return new;
end;
$$;

drop trigger if exists profiles_notify_welcome on public.profiles;
create trigger profiles_notify_welcome
  after insert on public.profiles
  for each row
  execute function public.notify_welcome();

-- ============================================================
--  Selesai. Tabel "applications", "profile", "interview_sessions",
--  "transcript_entries", "finance_accounts", "finance_expenses",
--  "finance_targets", "profiles", "capos_activity_logs", dan
--  "notifications" siap dipakai oleh index.html melalui Supabase
--  Auth (Google) + Supabase JS client.
-- ============================================================
