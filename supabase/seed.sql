-- =============================================================
-- NON-PRODUCTION SEED / TEST DATA — Milestone 4A
-- =============================================================
-- Everything in this file is placeholder data for local development and
-- testing the booking UI end-to-end. None of it is confirmed real business
-- information:
--   - service durations/prices mirror src/config/business.js, which itself
--     is explicitly labeled placeholder pricing pending Emmanuelle's
--     approval.
--   - availability_rules hours (Mon–Sat 9–6, Sat 10–4, Sun closed) are a
--     reasonable placeholder schedule, NOT confirmed real hours.
--   - booking_policies bodies are left NULL — no policy content is
--     invented, matching src/config/business.js.
--   - No blocked_dates or appointments are seeded; add your own locally if
--     you want to test the "day is fully booked" / "date is blocked" paths.
--
-- Run with: supabase db reset (applies migrations then this file), or
-- `psql -f supabase/seed.sql` against a dev database. Never run against
-- a production project without reviewing every row above first.
-- =============================================================

insert into public.services (id, name, duration_minutes, price_cents, price_is_placeholder, is_addon, active)
values
  ('natural-glam',    'Natural Glam',    45,  8500,  true, false, true),
  ('soft-glam',       'Soft Glam',       60,  12500, true, false, true),
  ('full-glam',       'Full Glam',       75,  15000, true, false, true),
  ('bridal-makeup',   'Bridal Makeup',   120, 22500, true, false, true),
  ('special-event-glam',      'Special Event Glam',     60, 13500, true, true, true),
  ('bridal-trial',            'Bridal Trial',           60, 16500, true, true, true),
  ('1-on-1-makeup-lesson',    '1-on-1 Makeup Lesson',   90, 17500, true, true, true)
on conflict (id) do update set
  name = excluded.name,
  duration_minutes = excluded.duration_minutes,
  price_cents = excluded.price_cents,
  price_is_placeholder = excluded.price_is_placeholder,
  is_addon = excluded.is_addon,
  active = excluded.active;

-- Placeholder weekly schedule — NOT confirmed real hours.
insert into public.availability_rules (weekday, is_closed, open_time, close_time, buffer_minutes)
values
  (0, true,  null,     null,     15), -- Sunday: closed
  (1, false, '09:00',  '18:00',  15),
  (2, false, '09:00',  '18:00',  15),
  (3, false, '09:00',  '18:00',  15),
  (4, false, '09:00',  '18:00',  15),
  (5, false, '09:00',  '18:00',  15),
  (6, false, '10:00',  '16:00',  15)
on conflict (weekday) do update set
  is_closed = excluded.is_closed,
  open_time = excluded.open_time,
  close_time = excluded.close_time,
  buffer_minutes = excluded.buffer_minutes;

-- Policy categories only — body intentionally left NULL, nothing invented.
insert into public.booking_policies (id, title, sort_order)
values
  ('deposits-payment',            'Deposits & Payment',              1),
  ('cancellation-rescheduling',   'Cancellation & Rescheduling',     2),
  ('late-arrivals-no-shows',      'Late Arrivals & No-Shows',        3),
  ('appointment-prep',            'Appointment Prep',                4),
  ('travel-location',             'Travel / Location',               5)
on conflict (id) do update set
  title = excluded.title,
  sort_order = excluded.sort_order;
