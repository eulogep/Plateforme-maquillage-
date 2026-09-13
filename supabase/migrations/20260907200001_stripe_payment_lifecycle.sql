-- Milestone 5 — Stripe test-mode payment + booking hold lifecycle
--
-- Deposit configuration (deposit_type/deposit_value) is NOT an Emmanuelle-
-- confirmed business policy — see supabase/functions/_shared/depositConfig.js
-- and src/config/business.js. This migration only adds the columns needed
-- to snapshot whatever configuration was actually in effect at payment-
-- creation time onto each appointment, so a later config change can never
-- retroactively alter a historical booking's amounts.

-- ---------------------------------------------------------------------
-- 1) Booking hold + payment snapshot columns on appointments.
--
-- hold_expires_at: when this pending/payment_pending row's claim on the
-- slot lapses if payment isn't completed. The actual release of the slot
-- happens when something (create-booking's or create-payment-intent's
-- lazy-expiry sweep, or the webhook) flips status to 'expired' — an
-- exclusion constraint's predicate can't reference now(), so expiry can't
-- be "instant" at the database level; see supabase/functions/_shared/expireStaleHolds.js.

alter table public.appointments
  add column if not exists hold_expires_at timestamptz,
  add column if not exists service_price_cents integer check (service_price_cents is null or service_price_cents >= 0),
  add column if not exists deposit_type text check (deposit_type is null or deposit_type in ('fixed', 'percentage', 'full_payment')),
  add column if not exists deposit_value numeric check (deposit_value is null or deposit_value >= 0),
  add column if not exists amount_due_now_cents integer check (amount_due_now_cents is null or amount_due_now_cents >= 0),
  add column if not exists remaining_balance_cents integer check (remaining_balance_cents is null or remaining_balance_cents >= 0),
  add column if not exists stripe_payment_intent_id text,
  add column if not exists payment_status text not null default 'none'
    check (payment_status in ('none', 'requires_payment', 'processing', 'succeeded', 'failed', 'canceled'));

create unique index if not exists appointments_stripe_payment_intent_id_unique
  on public.appointments (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create index if not exists appointments_hold_expires_at_idx
  on public.appointments (hold_expires_at)
  where status in ('pending', 'payment_pending');

comment on column public.appointments.deposit_type is
  'Snapshot of the deposit configuration in effect when the PaymentIntent was created — NOT a live reference. See supabase/functions/_shared/depositConfig.js; not yet confirmed by Emmanuelle.';

-- ---------------------------------------------------------------------
-- 2) Stripe webhook event dedup — Stripe redelivers events, and delivery
-- is at-least-once. Recording processed event ids makes webhook handling
-- idempotent: a redelivered event is a no-op, not a double-apply.

create table if not exists public.stripe_events (
  id text primary key, -- Stripe's event id (evt_...)
  type text not null,
  processed_at timestamptz not null default now()
);

comment on table public.stripe_events is
  'Processed Stripe webhook event ids, for idempotent webhook handling. Service-role only.';

alter table public.stripe_events enable row level security;
-- No anon/authenticated policies — only the webhook function (service role)
-- ever touches this table.

-- ---------------------------------------------------------------------
-- 3) Payment exceptions — the "expired hold + late successful payment"
-- case (and any other payment-succeeded-but-can't-honor-slot case). These
-- rows require human resolution (refund, or manual re-accommodation) —
-- this migration does not implement or invent a refund policy.

create table if not exists public.payment_exceptions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments (id) on delete set null,
  stripe_payment_intent_id text,
  stripe_event_id text,
  reason text not null,
  amount_cents integer,
  resolved boolean not null default false,
  resolution_notes text,
  created_at timestamptz not null default now()
);

comment on table public.payment_exceptions is
  'Payments that succeeded but could not be safely applied to a booking (e.g. the hold had already expired/been cancelled). Requires manual resolution — no refund policy is implemented or assumed here.';

alter table public.payment_exceptions enable row level security;
-- No anon/authenticated policies — service-role (and, later, an admin
-- tool) only.

-- ---------------------------------------------------------------------
-- 4) A narrow, safe status-read path for the client.
--
-- The client needs to poll "is my booking confirmed yet" after submitting
-- payment, but appointments has zero anon SELECT policies (by design —
-- see Milestone 4A/4B). Rather than opening up broader read access, this
-- SECURITY DEFINER function returns only status/payment_status for one
-- appointment id — and only if the caller already knows that id (returned
-- to them at booking-creation time). Knowing a random UUID grants nothing
-- else; this leaks no other appointment's data and no list of ids.

create or replace function public.get_booking_status(p_appointment_id uuid)
returns table (status text, payment_status text)
language sql
security definer
set search_path = public
stable
as $$
  select status, payment_status
  from public.appointments
  where id = p_appointment_id;
$$;

grant execute on function public.get_booking_status(uuid) to anon, authenticated;
