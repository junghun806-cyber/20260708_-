-- Run this once in the Supabase SQL Editor (Dashboard > SQL Editor).
create table if not exists public.directions_clicks (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  park_name text not null,
  detail_location text not null,
  trash_type text not null,
  gu text not null,
  had_geolocation boolean not null default false
);

alter table public.directions_clicks enable row level security;

-- Anyone (including the anonymous browser client) can insert a click log row,
-- but nobody can read/update/delete via the public API — only from the
-- Supabase dashboard (service role) for KPI review.
drop policy if exists "allow anonymous insert" on public.directions_clicks;

create policy "allow anonymous insert" on public.directions_clicks
  for insert
  to anon
  with check (true);
