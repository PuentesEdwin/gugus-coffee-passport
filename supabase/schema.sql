-- Gugus Coffee Passport · run once in Supabase → SQL Editor
-- The app talks to Supabase only from its own server (Vercel functions) with the
-- service role key, so the table and bucket stay closed to the public.

create table if not exists public.passport_entries (
  id text primary key,          -- entry id, or '__settings'
  data jsonb not null,          -- the whole passport page
  updated_at timestamptz not null default now()
);

alter table public.passport_entries enable row level security;
-- No policies on purpose: only the server (service role) can read or write.

-- Private bucket for the storefront and coffee photos
insert into storage.buckets (id, name, public)
values ('passport-photos', 'passport-photos', false)
on conflict (id) do nothing;

-- Friends' passports (Oct 2026): every row belongs to one passport, and each friend signs in
-- with a passport name + PIN. The Gugus passport keeps using PASSPORT_PIN from Vercel.
create table if not exists public.passport_users (
  id text primary key check (id ~ '^[a-z0-9-]{2,32}$'),  -- the passport name typed on the cover
  name text not null,                                     -- shown on the cover at first
  pass_hash text not null,                                -- scrypt$salt$hash, see scripts/new-passport.mjs
  created_at timestamptz not null default now()
);
alter table public.passport_users enable row level security;

alter table public.passport_entries add column if not exists passport_id text not null default 'gugus';
alter table public.passport_entries drop constraint if exists passport_entries_pkey;
alter table public.passport_entries add primary key (passport_id, id);
