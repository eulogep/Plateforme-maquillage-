# Live Stripe test-mode verification (Milestone 5)

## Results — run 2026-09-06, project `emma-cosmetics-dev`, Stripe test mode

All migrations/functions were deployed live (`create-booking` updated,
`create-payment-intent` and `stripe-webhook` newly deployed;
`stripe-webhook` deployed with `--no-verify-jwt` since Stripe never sends a
Supabase auth token). `STRIPE_SECRET_KEY` (a restricted `rk_test_...` key,
scoped to PaymentIntents) and `STRIPE_WEBHOOK_SECRET` were set via
`supabase secrets set`. Every test below used real Stripe test-mode API
calls and a real webhook endpoint registered in the Stripe Dashboard — not
simulated.

| Test | Result | Evidence |
|---|---|---|
| A. Successful test payment | ✅ PASS | `pi_..._visa` confirmed `succeeded`, amount_received matched exactly; appointment went `pending → payment_pending → confirmed`, `payment_status: succeeded`, via a real webhook delivery |
| B. Declined test card | ✅ PASS | `pm_card_visa_chargeDeclined` → `card_error`/`generic_decline`; appointment stayed `payment_pending`, `payment_status` became `failed` via webhook — never confirmed |
| C. Card requiring authentication | ✅ PASS (to the achievable limit) | `pm_card_authenticationRequired` → PaymentIntent correctly entered `requires_action` with a 3DS `redirect_to_url`; appointment correctly stayed `payment_pending`/`requires_payment`. Completing the actual 3DS challenge needs a browser (Stripe's hosted auth page) — not exercised here, since this environment has no browser automation |
| D. PaymentIntent metadata | ✅ PASS | `metadata: {appointment_id, service_id, environment: "test"}` present and correct on the real Stripe object |
| E. Webhook signature verification | ✅ PASS | Real signed events from Stripe were correctly accepted (including one from an unrelated `payment_intent.canceled` sent during permission testing); a forged signature was correctly rejected with `400` |
| F. Duplicate webhook delivery | ✅ PASS | Fetched the real already-processed `payment_intent.succeeded` event, computed a fresh valid signature for it, and replayed it — response was `{"received":true,"deduped":true}`, no reprocessing |
| G. pending → payment_pending → confirmed | ✅ PASS | All three states observed in the database in order, for test A |
| H. Failed payment does not confirm | ✅ PASS | Same evidence as B |
| I. Expired hold releases availability | ✅ PASS | Manually aged an appointment's `hold_expires_at` into the past (simulating elapsed time), then a **new** `create-booking` call for the exact same slot succeeded — the lazy sweep flipped the stale hold to `expired` first |
| J. Late payment cannot produce overlapping confirmed bookings | ✅ PASS — the critical scenario | See below |

### Test J in detail (the expired-hold + late-payment race)

1. Appointment **D** created, PaymentIntent created (`payment_pending`).
2. D's `hold_expires_at` manually set to the past (simulating the customer abandoning payment).
3. A **new** appointment **E** created for the exact same slot — succeeded (D's stale hold was swept to `expired` first).
4. D's *original* PaymentIntent was then confirmed with a valid test card — **it genuinely succeeded on Stripe's side** (`amount_received: 3750`).
5. Verified in the database:
   - D: `status: expired`, `payment_status: requires_payment` — **never confirmed**, despite the real successful payment.
   - E: `status: pending`, untouched.
   - A `payment_exceptions` row was created: `{appointment_id: D, stripe_payment_intent_id: pi_..., reason: "appointment_status_expired", amount_cents: 3750, resolved: false}` — a real $37.50 (test-mode) payment correctly flagged for manual resolution (refund or manual re-accommodation) instead of silently confirming a booking that would have overlapped E.
   - No overlapping active (`pending`/`payment_pending`/`confirmed`) row existed for that slot at any point.

This is exactly the documented policy in `supabase/functions/stripe-webhook/logic.js`'s `decideSucceededOutcome()`, now verified against real, live infrastructure rather than only unit tests.

### Cleanup

All test appointments/customers created during this run were deleted
afterward (same discipline as Milestone 4C) — `payment_exceptions` and
`stripe_events` rows were left in place as harmless audit trail (comparable
to Stripe's own test-mode event log), not user-facing and not seed data.
Seed data (`services`, `availability_rules`, `booking_policies`) was
untouched throughout.

## Prerequisites for re-running

```bash
export SUPABASE_ACCESS_TOKEN=<personal-access-token>
supabase link --project-ref <project-ref>
supabase db push
supabase functions deploy create-booking
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook --no-verify-jwt   # Stripe sends no Supabase JWT
supabase secrets set STRIPE_SECRET_KEY=<sk_test_... or scoped rk_test_...>
supabase secrets set STRIPE_WEBHOOK_SECRET=<whsec_...>
```

In the Stripe Dashboard (test mode): **Developers → Webhooks → Add
endpoint**, pointing at
`https://<project-ref>.supabase.co/functions/v1/stripe-webhook`, subscribed
to at minimum `payment_intent.succeeded`, `payment_intent.payment_failed`,
`payment_intent.canceled`.

Stripe's special test PaymentMethod tokens (no Stripe.js/browser needed)
used for these tests: `pm_card_visa` (success), `pm_card_visa_chargeDeclined`
(decline), `pm_card_authenticationRequired` (3DS). Confirm via
`POST /v1/payment_intents/{id}/confirm` with `payment_method=<token>` and
`return_url=<any URL>` (required because `automatic_payment_methods` is
enabled with redirects allowed) using the same restricted/secret key as the
functions.
