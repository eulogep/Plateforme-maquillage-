# Email notifications + calendar (Milestone 6)

## Architecture

- **Provider: [Resend](https://resend.com)**, called via a plain HTTP POST
  (`_shared/notifications/resendClient.js`) — no SDK dependency, keeps the
  Deno import surface minimal.
- All sending happens server-side, inline in the two functions that already
  own the relevant transitions (no separate "email function" — both are
  already trusted server logic with the service role):
  - `create-payment-intent` sends **booking_payment_pending** right after
    the appointment transitions to `payment_pending`.
  - `stripe-webhook` sends **booking_confirmed** right after a verified
    payment confirms the appointment, and **payment_failed** on a genuine
    decline (not on an intentional cancel).
  - **booking_expired** fires from `create-payment-intent` too: if its
    scoped sweep discovers the appointment being paid for *just* expired
    (the customer returned to complete payment after their hold lapsed),
    that's a real, natural trigger — the email fires there before the
    "no longer payable" error is returned. Not wired for
    `create-booking`'s *global* multi-row sweep — see "What's NOT wired".
- `_shared/notifications/`:
  - `content.js` — pure template builders (subject/html/text) for all four
    event types. Never fabricates cancellation/deposit policy text, an
    address, or a phone number — optional fields are omitted from the
    output entirely when absent. `_shared/businessInfo.js` now contains the
    confirmed primary phone and booking email.
  - `decision.js` — pure idempotency decision (`decideNotificationAction`)
    and the confirmation-email safety check (`canSendConfirmationEmail`
    refuses anything but a genuinely `confirmed` appointment).
  - `send.js` — orchestrates: idempotency check against
    `notification_events`, build content, call Resend, record the
    outcome. Never throws — a failure here cannot roll back or block the
    booking/payment operation that triggered it (per the milestone's
    explicit requirement).
  - `resendClient.js` — the HTTP call itself.

## Migrations

`20260907300001_notifications_and_calendar.sql`:
- `notification_events` — unique `(appointment_id, notification_type)`.
  This is the actual idempotency guarantee: a redelivered Stripe webhook
  either finds the row already `sent` (skip) or retries the same row
  (never a second row, never a duplicate email).
- `calendar_events` — unique `appointment_id`. Same guarantee for calendar
  sync: at most one Google Calendar event per appointment, ever.
- Both tables: RLS enabled, zero anon/authenticated policies (service-role
  only, same posture as every other server-owned table since Milestone 4A).

## Retry / failure strategy

`notification_events.status` is `pending` → `sent` | `failed`, with
`retry_count`, `last_error`, `provider_message_id`, `sent_at`. A `failed`
row (under a retry cap of 5) is retried automatically the next time the
same trigger point naturally re-runs for that appointment (e.g. the
customer reloads the payment page, calling `create-payment-intent` again —
already idempotent for the PaymentIntent itself, and now also retries a
previously-failed `booking_payment_pending` email as a side effect). There
is no separate scheduled/cron retry job in this milestone — the
architecture (the `notification_events` table + `decideNotificationAction`)
supports adding one later without any other change.

## ICS (.ics) — real, implemented

`src/booking/generateIcs.js` — pure, client-side, no new network round-trip
(all needed data is already on the client by the time an appointment is
confirmed). Anchors the appointment's business-local date/time explicitly
via `date-fns-tz`'s `fromZonedTime` to the business timezone
(`America/New_York`), then emits UTC (`Z`-suffixed) `DTSTART`/`DTEND` —
this is why timezone/DST correctness doesn't depend on the visitor's
browser timezone at all (verified for both EST and EDT offsets in tests).
Wired to the Confirmation screen's "Add to calendar" button, enabled only
once the appointment is genuinely `confirmed` (real `.ics` file download,
not a stub).

## Google Calendar — scaffolded, real code, untested live

`_shared/googleCalendar/`:
- `payload.js` — pure: `isGoogleCalendarConfigured`,
  `buildCalendarEventPayload`, `computeGoogleEventTimes` (naive local
  datetime + `timeZone` field, Google's documented approach — no UTC
  conversion needed since Google's API does that itself),
  `decideCalendarSyncAction`.
- `sync.js` — the I/O half: refreshes an access token from a stored
  `GOOGLE_REFRESH_TOKEN` (standard OAuth "offline access" flow, authorized
  **once** for the business's own Google account — never a customer-facing
  OAuth flow), then `POST`s to Calendar API v3. Checks `calendar_events`
  for an existing row first (idempotent) and records the outcome
  (`created`/`failed`) regardless of success.
- Wired into `stripe-webhook`'s confirm branch, right after the
  confirmation email. **No-ops cleanly** (`{action: 'skipped', reason:
  'not_configured'}`) if any of `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/
  `GOOGLE_REFRESH_TOKEN`/`GOOGLE_CALENDAR_ID` is missing — never blocks
  confirmation.

**Status: no Google credentials available in this environment.** The code
is real and unit-tested (pure logic), but the actual OAuth token refresh +
Calendar API call has not been exercised against a live Google account.
See "Remaining work" below for exactly what's needed.

## What's NOT wired (by design, this milestone)

- `create-booking`'s *global* multi-row sweep (which can expire several
  unrelated holds in one call, before checking availability for a new
  booking) does not send `booking_expired` emails for the rows it sweeps —
  doing so would need to look up each affected row's customer in bulk.
  The single-appointment case (`create-payment-intent`, above) is wired
  and covers the most common real scenario (a customer returning to
  finish payment late).
- No cancellation/reschedule flow exists yet in the app at all, so
  `calendar_events` update/delete is not implemented — only creation. The
  schema and provider field are structured so that's additive later, not a
  redesign.

## Setup for live testing

```bash
supabase db push
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook --no-verify-jwt
supabase secrets set RESEND_API_KEY=<key>
supabase secrets set RESEND_FROM_EMAIL=<verified-sender>
# Optional — only if testing Google Calendar sync:
supabase secrets set GOOGLE_CLIENT_ID=<id>
supabase secrets set GOOGLE_CLIENT_SECRET=<secret>
supabase secrets set GOOGLE_REFRESH_TOKEN=<token>
supabase secrets set GOOGLE_CALENDAR_ID=<calendar-id-or-primary>
```

## Live verification results — run 2026-09-06/07, project `emma-cosmetics-dev`

Real Resend account, real Stripe test-mode payments, real webhook
deliveries — not simulated.

| Test | Result | Evidence |
|---|---|---|
| A. Real test transactional email sent | ✅ PASS | `booking_payment_pending` and `booking_confirmed` both delivered with real Resend message ids |
| B. Verify receipt | ⚠️ Partial | Confirmed *accepted for delivery* by Resend (200 response + message id); actual inbox receipt not visually confirmed in this environment |
| C. Provider message id stored | ✅ PASS | e.g. `157b54ca-2dd2-47e2-94d1-d5218ab34755` (payment_pending), `dd0dcb80-2c20-4620-a3df-2158ef3d31f9` (confirmed) |
| D. Replay same event, no duplicate | ✅ PASS | Two ways: (1) calling `create-payment-intent` again for an already-emailed appointment left `notification_events` unchanged (same message id, no new send); (2) replaying the real `payment_intent.succeeded` Stripe event with a freshly-computed valid signature returned `{"received":true,"deduped":true}` before notification logic even ran |
| E. Generate/download real .ics | ✅ PASS | Generated for the actual confirmed appointment's real data — see below |
| F. Import .ics into a calendar, confirm time | ⚠️ Partial | Verified programmatically: `DTSTART:20300910T140000Z` for a 10:00 AM appointment on 2030-09-10 — correct, since Sept 10 2030 is Eastern *Daylight* Time (UTC-4), so 10:00 EDT = 14:00 UTC, exactly as computed. Actual visual import into a calendar app not performed (no GUI in this environment) |
| G. Real Google Calendar test event | N/A | Skipped by choice — no Google credentials provided this milestone |
| H. Replay webhook, no duplicate calendar event | N/A | Same reason as G |

### Real bug caught during verification (not a bug — expected behavior)

The first attempt used an email address that turned out not to be the
Resend account's verified sandbox address. The system did exactly what it
was built to do: recorded the send as `failed` with Resend's real error
message, did **not** affect the booking/payment success, and correctly
retried (and succeeded) once pointed at the right address — this
incidentally doubled as a live test of the retry path (not explicitly
listed as one of A–H, but directly demonstrates requirement #5's "store
failed attempts and allow retry").

### Payment_failed email

Also verified live (not one of the A–H list, but directly required by
section 2.C): a declined test card triggered a real `payment_failed`
email with its own message id, independent of the `booking_payment_pending`
email already sent for that appointment.

### Cleanup

All test appointments/customers/their notification rows (cascade-deleted
with the appointment) were removed afterward. Seed data untouched.
