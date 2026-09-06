-- Milestone 4A — public availability view
--
-- The client needs to know which time windows are already taken in order
-- to compute open slots, but must never see customer_id, notes, or
-- occasion. This view exposes only the scheduling-relevant columns, for
-- appointments that actually hold a slot (pending or confirmed) — a
-- cancelled/no_show appointment should not block the slot it used to hold.
--
-- The underlying `appointments` table has no anon/authenticated RLS
-- policies at all (see 20260907000003), so this view is the only path the
-- public anon key has into appointment data, and only these four columns.
--
-- Deliberately NOT security_invoker: this view must run with the view
-- owner's privileges (the default) so it can read the base table on the
-- caller's behalf despite the caller (anon) having no direct RLS grant on
-- `appointments` — that's what keeps the base table PII-free for anon
-- while still letting availability computation work.

create or replace view public.appointment_busy_windows as
select
  service_id,
  appointment_date,
  start_time,
  end_time
from public.appointments
where status in ('pending', 'confirmed');

comment on view public.appointment_busy_windows is
  'Public, PII-free read of which windows are already booked, for availability computation only.';

grant select on public.appointment_busy_windows to anon, authenticated;
