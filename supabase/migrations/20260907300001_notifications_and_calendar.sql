-- Milestone 6 — email notifications + calendar sync
--
-- Both new tables are service-role only (same posture as customers,
-- appointments, stripe_events, payment_exceptions): RLS enabled, zero
-- anon/authenticated policies. Notifications and calendar sync are sent
-- from server-side Edge Function logic only.

-- ---------------------------------------------------------------------
-- 1) notification_events — idempotency + retry tracking for transactional
-- emails. One row per (appointment, notification type): a unique
-- constraint means a repeated trigger (e.g. a redelivered Stripe webhook)
-- either finds nothing to do (already 'sent') or updates the same row
-- (retry after 'failed') rather than ever creating a duplicate.

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  notification_type text not null
    check (notification_type in ('booking_payment_pending', 'booking_confirmed', 'payment_failed', 'booking_expired')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  provider_message_id text,
  last_error text,
  retry_count integer not null default 0,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create unique index if not exists notification_events_appointment_type_unique
  on public.notification_events (appointment_id, notification_type);

comment on table public.notification_events is
  'Tracks one transactional-email attempt per (appointment, event type). A failed send stays retryable; a sent one is never repeated, even across webhook redeliveries. Service-role only.';

alter table public.notification_events enable row level security;
-- No anon/authenticated policies.

-- ---------------------------------------------------------------------
-- 2) calendar_events — external (Google) calendar event mapping. A unique
-- constraint on appointment_id is the idempotency guarantee: at most one
-- calendar event is ever created per appointment, regardless of how many
-- times the confirming webhook is redelivered.

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  provider text not null default 'google',
  external_event_id text,
  external_calendar_id text,
  status text not null default 'pending' check (status in ('pending', 'created', 'failed')),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists calendar_events_appointment_unique
  on public.calendar_events (appointment_id);

comment on table public.calendar_events is
  'External calendar sync status per appointment (currently Google Calendar). One row per appointment, enforced by the unique index, so repeated webhook delivery can never create duplicate calendar events. Service-role only.';

alter table public.calendar_events enable row level security;
-- No anon/authenticated policies.
