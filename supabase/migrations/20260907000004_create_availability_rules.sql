-- Milestone 4A — availability_rules
--
-- One row per weekday (0 = Sunday .. 6 = Saturday), matching JavaScript's
-- Date#getDay() convention used throughout the booking domain layer.
-- is_closed = true means the business does not take appointments that
-- weekday at all. buffer_minutes is configurable per weekday (defaults
-- uniform) rather than hardcoded, per requirement.
--
-- NOTE: seeded values are non-production placeholders — see seed.sql.
-- Emmanuelle's real hours have not been confirmed.

create table if not exists public.availability_rules (
  weekday smallint primary key check (weekday between 0 and 6),
  is_closed boolean not null default false,
  open_time time,
  close_time time,
  buffer_minutes integer not null default 15 check (buffer_minutes >= 0),
  updated_at timestamptz not null default now(),
  constraint open_close_required_unless_closed check (
    is_closed or (open_time is not null and close_time is not null and close_time > open_time)
  )
);

comment on table public.availability_rules is
  'Per-weekday business hours + booking buffer. Placeholder values until Emmanuelle confirms real hours (see seed.sql).';

alter table public.availability_rules enable row level security;

create policy "availability rules are publicly readable"
  on public.availability_rules for select
  using (true);
