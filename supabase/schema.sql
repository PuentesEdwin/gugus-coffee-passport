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

-- Editable passport names (Oct 2026): "login" is what people type on the cover and can change in
-- Settings; "id" never changes. The Gugus row has no hash: its PIN stays in PASSPORT_PIN.
alter table public.passport_users add column if not exists login text;
update public.passport_users set login = id where login is null;
alter table public.passport_users alter column login set not null;
alter table public.passport_users add constraint passport_users_login_key unique (login);
alter table public.passport_users add constraint passport_users_login_check check (login ~ '^[a-z0-9-]{2,32}$');
alter table public.passport_users alter column pass_hash drop not null;
insert into public.passport_users (id, name, login, pass_hash) values ('gugus', 'The Gugus', 'gugus', null)
on conflict (id) do nothing;
