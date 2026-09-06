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
    output entirely when absent (see `_shared/businessInfo.js`, where
    `contactPhone` stays `null`).
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

## Live verification results

_To be filled in once run — see the main milestone report for current
status._
