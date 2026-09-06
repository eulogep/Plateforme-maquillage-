-- Milestone 4B — atomic booking creation support
--
-- Appointment status lifecycle (see also src/booking/statuses.js):
--   pending          -> booking request received; no payment step exists yet
--                       (this is the status this milestone actually creates)
--   payment_pending  -> a deposit/payment attempt has been initiated
--                       (introduced once Stripe is wired up)
--   confirmed        -> payment succeeded / deposit collected
--   completed        -> the appointment took place
--   cancelled        -> cancelled by client or Emmanuelle
--   expired          -> never moved past pending/payment_pending in time
--   no_show          -> client did not show up
-- Only pending/payment_pending/confirmed actually occupy a calendar slot
-- (see the exclusion constraint below) — the rest free it up.

alter table public.appointments drop constraint if exists appointments_status_check;
alter table public.appointments add constraint appointments_status_check
  check (status in ('pending', 'payment_pending', 'confirmed', 'cancelled', 'completed', 'expired', 'no_show'));
--
-- Adds what the create-booking Edge Function needs to (a) guarantee no
-- double-booking at the database level, (b) be idempotent under retries,
-- and (c) avoid duplicate customer rows for the same person.

-- ---------------------------------------------------------------------
-- 1) No-double-booking guarantee: a PostgreSQL exclusion constraint.
--
-- This is enforced by the database itself, not application code, so it is
-- immune to the classic "SELECT is free, then INSERT" race: if two
-- concurrent requests try to insert overlapping active appointments,
-- Postgres guarantees at most one of the two INSERTs succeeds — the other
-- raises a 23P01 (exclusion_violation) error, which the Edge Function
-- catches and reports as SLOT_UNAVAILABLE.
--
-- `buffer_minutes_applied` captures the buffer that was actually in effect
-- at booking time (from availability_rules), stored on the row itself —
-- an exclusion constraint's expression can only reference columns on the
-- same row, so this can't be a live join to availability_rules.
--
-- `occupied_range` folds appointment_date + start_time/end_time + buffer
-- into a single timestamp range so the exclusion constraint can use a
-- native GiST range-overlap ("&&") check.
--
-- The constraint is partial (WHERE status in (...)) so only appointments
-- that actually occupy the slot participate — a cancelled/expired/
-- completed/no_show appointment frees the slot for reuse.

alter table public.appointments
  add column if not exists buffer_minutes_applied integer not null default 0 check (buffer_minutes_applied >= 0);

alter table public.appointments
  add column if not exists occupied_range tsrange generated always as (
    tsrange(
      (appointment_date + start_time),
      (appointment_date + end_time) + make_interval(mins => buffer_minutes_applied),
      '[)'
    )
  ) stored;

create index if not exists appointments_occupied_range_gist
  on public.appointments using gist (occupied_range);

alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (occupied_range with &&)
  where (status in ('pending', 'payment_pending', 'confirmed'));

-- ---------------------------------------------------------------------
-- 2) Idempotency: a client-generated request UUID, unique per row.
--
-- request_payload_hash lets the Edge Function distinguish "the exact same
-- request, retried" (same key + same hash -> return the original result)
-- from "this key was reused for a different booking" (same key, different
-- hash -> DUPLICATE_REQUEST error), per the app's idempotency contract.

alter table public.appointments
  add column if not exists idempotency_key uuid,
  add column if not exists request_payload_hash text;

create unique index if not exists appointments_idempotency_key_unique
  on public.appointments (idempotency_key)
  where idempotency_key is not null;

-- ---------------------------------------------------------------------
-- 3) Inspiration photo — object path only, never the raw file (see
-- Supabase Storage bucket + policies in the next migration).

alter table public.appointments
  add column if not exists inspiration_photo_path text;

-- ---------------------------------------------------------------------
-- 4) Customer deduplication: a normalized, unique email so the same
-- person booking twice reuses one customer row (upserted via
-- `on conflict (normalized_email)` in the Edge Function) instead of
-- creating a duplicate. Phone-based fuzzy matching is not implemented in
-- this milestone — email is the sole dedupe key for now.

alter table public.customers
  add column if not exists normalized_email text generated always as (lower(trim(email))) stored;

create unique index if not exists customers_normalized_email_unique
  on public.customers (normalized_email);
