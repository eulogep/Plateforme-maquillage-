-- =============================================================
-- NON-PRODUCTION SEED / TEST DATA — Milestone 4A
-- =============================================================
-- This file mixes confirmed business configuration with clearly marked
-- local-only availability defaults:
--   - Basic Glam, Signature Glam and Essential Bridal prices/names are
--     confirmed. Only the Bridal duration was present in the accepted source;
--     the other durations remain scheduling placeholders.
--   - availability_rules hours (Mon–Sat 9–6, Sat 10–4, Sun closed) are a
--     reasonable placeholder schedule, NOT confirmed real hours.
--   - booking_policies contain the wording confirmed on 2026-09-10.
--   - No blocked_dates or appointments are seeded; add your own locally if
--     you want to test the "day is fully booked" / "date is blocked" paths.
--
-- Run with: supabase db reset (applies migrations then this file), or
-- `psql -f supabase/seed.sql` against a dev database. Never run against
-- a production project without reviewing every row above first.
-- =============================================================

insert into public.services (id, name, duration_minutes, price_cents, price_is_placeholder, is_addon, active)
values
  ('natural-glam',    'Basic Glam',      45,  13000, false, false, true),
  ('soft-glam',       'Soft Glam',       60,  12500, true, false, true),
  ('full-glam',       'Signature Glam',  75,  15000, false, false, true),
  ('bridal-makeup',   'Essential Bridal Package', 90, 60000, false, false, true),
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

-- Confirmed booking-policy copy (2026-09-10).
insert into public.booking_policies (id, title, body, sort_order)
values
  ('deposits-payment', 'Deposits & Payment', 'A $50 deposit is required for every booking and is non-refundable and non-transferable. The remaining balance is due in cash on the appointment day. Bridal balances are due in full 30 days before the wedding.', 1),
  ('cancellation-rescheduling', 'Cancellation & Rescheduling', 'You may reschedule once when you provide at least 24 hours notice. The booking deposit is non-refundable and non-transferable.', 2),
  ('late-arrivals-no-shows', 'Late Arrivals & No-Shows', 'A $25 fee applies after 15 minutes, plus $1 for each additional minute. Appointments are cancelled after 30 minutes late.', 3),
  ('appointment-prep', 'Appointment Prep', 'Check the address, service, date, and time in your confirmation email. Contact Emmanuelle before your appointment if any detail is incorrect.', 4),
  ('travel-location', 'Travel / Location', 'On-location travel starts at $25. The On Demand Glam includes travel within 15 miles of ZIP code 30318; extra mileage is $5 per mile. Out-of-state travel requires the client to cover accommodation. Sunday and before-7 AM or after-7 PM appointments carry a $30 fee and must be requested directly by email.', 5)
on conflict (id) do update set
  title = excluded.title,
  body = excluded.body,
  sort_order = excluded.sort_order;
