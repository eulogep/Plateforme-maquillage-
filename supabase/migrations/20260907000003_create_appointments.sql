-- Milestone 4A — appointments
--
-- Read-side only in this milestone: the availability layer queries this
-- table (via the restricted view below) to know which windows are already
-- taken, so slot generation doesn't offer times that would double-book.
-- No row is ever inserted by the client yet — atomic, race-safe creation
-- with server-side re-validation is Milestone 4B.
--
-- appointment_date/start_time/end_time are stored as wall-clock values in
-- the business timezone (see business.location.timezone in
-- src/config/business.js), not UTC instants — this is a single-location,
-- single-timezone business, so storing local wall-clock time avoids DST
-- conversion bugs when computing "is this slot free" against opening hours
-- that are themselves defined as local wall-clock time.

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers (id) on delete set null,
  service_id text not null references public.services (id),
  appointment_date date not null,
  start_time time not null,
  end_time time not null check (end_time > start_time),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  occasion text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.appointments is
  'Booked appointments. Status lifecycle (pending/confirmed/cancelled/completed/no_show) is finalized in Milestone 4B; every row created before then stays pending.';

create index if not exists appointments_date_idx on public.appointments (appointment_date);

alter table public.appointments enable row level security;
-- No anon/authenticated policies on the base table — customer-adjacent
-- data (notes, occasion) must not be publicly readable. The public
-- availability layer reads through the busy-windows view created in
-- 20260907000007_views_and_grants.sql instead.
