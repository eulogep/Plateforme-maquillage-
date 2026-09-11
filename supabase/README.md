# Supabase schema + functions (Milestones 4A–4B)

This project doesn't have a live Supabase project connected yet — these are
hand-authored migrations (and, from 4B, an Edge Function) ready to apply
once one exists.

## Setup

1. Create a Supabase project (or use the [local dev stack](https://supabase.com/docs/guides/cli/local-development) via the Supabase CLI).
2. Apply the schema:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push        # applies migrations/*.sql in order
   ```
   Or, without the CLI, run each file in `migrations/` in order against the
   project's SQL editor.
3. (Optional, dev only) Load placeholder seed data — **non-production**,
   see the header comment in `seed.sql`:
   ```bash
   supabase db reset       # local dev: migrations + seed.sql
   # or: psql <connection-string> -f supabase/seed.sql
   ```
4. Copy `.env.example` to `.env` and fill in the project's URL and anon key.
5. Deploy the booking-creation Edge Function — see
   `functions/create-booking/README.md`.

## Tables

| Table | Purpose | Public (anon) read? |
|---|---|---|
| `services` | Service durations/prices, keyed to match `src/config/business.js` ids | Yes |
| `availability_rules` | Per-weekday hours + booking buffer | Yes |
| `blocked_dates` | Fully-blocked individual dates | Yes |
| `booking_policies` | Policy categories (body left `null` until confirmed) | Yes |
| `appointments` | Booked appointments | No — only via the `appointment_busy_windows` view (service_id/date/time only, no customer data) |
| `customers` | Client contact info | No — service-role only |

Storage: an `inspiration-photos` bucket (private, no anon/authenticated
policies — only the service role, via the Edge Function, can read/write it).

## No-double-booking guarantee (Milestone 4B)

`appointments` has a partial PostgreSQL **exclusion constraint**
(`appointments_no_overlap`, added in
`20260907100001_booking_creation_constraints.sql`) on a generated
`occupied_range` column (appointment window + the buffer that was actually
applied), scoped to `status in ('pending','payment_pending','confirmed')`.
Two concurrent requests for an overlapping window can both pass a `SELECT`,
but at most one `INSERT` will ever succeed — Postgres itself rejects the
other with a `23P01` error, which `create-booking` maps to `SLOT_UNAVAILABLE`.
This is enforced by the database, not application code.

## What's real vs. mock right now

**Read-side** availability (`src/booking/availability.js`, Milestone 4A)
queries this schema for opening hours, blocked dates, service duration, and
existing appointments, falling back to `src/booking/mockAvailability.js`
when Supabase isn't configured.

**Booking creation** (Milestone 4B) goes through the `create-booking` Edge
Function (`functions/create-booking/`) — the client never writes to
`appointments`/`customers` directly. Every appointment it creates starts as
`status: 'pending'`; there's no payment step yet, so nothing ever becomes
`confirmed` in this milestone.
