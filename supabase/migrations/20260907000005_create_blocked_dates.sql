-- Milestone 4A — blocked_dates
--
-- Specific calendar dates (holidays, days off, etc.) that override the
-- weekday rule in availability_rules and make the whole day unavailable,
-- regardless of what that weekday's normal hours are.

create table if not exists public.blocked_dates (
  blocked_date date primary key,
  reason text,
  created_at timestamptz not null default now()
);

comment on table public.blocked_dates is
  'Individual dates fully blocked from booking (holidays, time off, etc.), independent of the weekly schedule.';

alter table public.blocked_dates enable row level security;

create policy "blocked dates are publicly readable"
  on public.blocked_dates for select
  using (true);
