-- Milestone 4A — services
--
-- Canonical service durations live here (needed for real availability
-- computation). `id` mirrors the ids already used in src/config/business.js
-- (e.g. 'natural-glam') so the two stay in sync without duplicating the
-- marketing copy (name/description/image/CTA text stay in business.js for
-- now). Price columns exist because a real booking record will need one,
-- but `price_is_placeholder` defaults true — pricing has not been
-- confirmed by Emmanuelle yet (see business.js's pricingDisclaimer).

create extension if not exists pgcrypto;

create table if not exists public.services (
  id text primary key,
  name text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer check (price_cents is null or price_cents >= 0),
  price_is_placeholder boolean not null default true,
  is_addon boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.services is
  'Bookable services. Duration drives availability math; price fields are placeholders until Emmanuelle confirms pricing (see price_is_placeholder).';

alter table public.services enable row level security;

-- Public (anon) read access — the marketing site and booking flow both
-- need to read active services without authenticating.
create policy "services are publicly readable"
  on public.services for select
  using (true);
