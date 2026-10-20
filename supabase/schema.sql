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
