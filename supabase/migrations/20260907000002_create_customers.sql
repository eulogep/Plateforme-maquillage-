-- Milestone 4A — customers
--
-- Not read or written by the app yet (booking creation is Milestone 4B).
-- Created now so appointments can reference it and RLS can be locked down
-- from day one: customer PII must never be readable via the public anon
-- key, only via the service role (server-side, Milestone 4B+).

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.customers is
  'Client contact info collected during booking. No anon access — service-role only.';

alter table public.customers enable row level security;
-- Intentionally no policies: RLS enabled with zero policies means the
-- anon/authenticated roles can read or write nothing. Only the service role
-- (which bypasses RLS) will touch this table, starting Milestone 4B.
