-- Business details confirmed by the client after the 2026-09-10 secondary
-- site audit. This migration updates database-backed booking facts without
-- replacing any booking, payment, availability, or concurrency mechanism.

insert into public.services (id, name, duration_minutes, price_cents, price_is_placeholder, is_addon, active)
values
  ('natural-glam', 'Basic Glam', 45, 13000, false, false, true),
  ('full-glam', 'Signature Glam', 75, 15000, false, false, true),
  ('bridal-makeup', 'Essential Bridal Package', 90, 60000, false, false, true)
on conflict (id) do update set
  name = excluded.name,
  duration_minutes = case
    when excluded.id = 'bridal-makeup' then excluded.duration_minutes
    else public.services.duration_minutes
  end,
  price_cents = excluded.price_cents,
  price_is_placeholder = excluded.price_is_placeholder,
  is_addon = excluded.is_addon,
  active = excluded.active,
  updated_at = now();

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
  sort_order = excluded.sort_order,
  updated_at = now();
