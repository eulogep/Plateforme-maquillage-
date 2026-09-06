# Supabase schema (Milestone 4A)

This project doesn't have a live Supabase project connected yet — these are
hand-authored migrations ready to apply once one exists.

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

## Tables

| Table | Purpose | Public (anon) read? |
|---|---|---|
| `services` | Service durations/prices, keyed to match `src/config/business.js` ids | Yes |
| `availability_rules` | Per-weekday hours + booking buffer | Yes |
| `blocked_dates` | Fully-blocked individual dates | Yes |
| `booking_policies` | Policy categories (body left `null` until confirmed) | Yes |
| `appointments` | Booked appointments | No — only via the `appointment_busy_windows` view (service_id/date/time only, no customer data) |
| `customers` | Client contact info | No — service-role only, starting Milestone 4B |

## What's real vs. mock right now

Milestone 4A wires up **read-side** availability (`src/booking/availability.js`)
against this schema: opening hours, blocked dates, service duration, and
existing appointments (via the view above) all come from Supabase when it's
configured. If `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` aren't set, the
app falls back to the original mock data (`src/booking/mockAvailability.js`)
so local development keeps working without a Supabase project.

Booking **creation** is still entirely client-side/unsaved — nothing writes
to `appointments` or `customers` yet. Atomic, race-safe creation with
server-side re-validation is Milestone 4B.
