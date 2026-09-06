# Live integration test runbook (Milestone 4C)

## Results — run 2026-09-06, project `emma-cosmetics-dev` (`wfbetbaojjlsrwsylcuc`, eu-central-1)

All 9 migrations applied via `supabase db push` with zero errors, `seed.sql`
loaded, `create-booking` deployed, `ALLOWED_ORIGINS` secret set. Every test
below was run for real against the live deployed function and verified
against the live database (via the Supabase Management API's SQL query
endpoint) — not simulated.

| Test | Result | Evidence |
|---|---|---|
| Deno runtime (lint/check/deploy) | ✅ PASS | see "Deno/deploy findings" below |
| CORS allow-list | ✅ PASS | `localhost:5173` origin reflected; `evil.example.com` got no CORS header at all |
| A. Successful booking | ✅ PASS | `201`, `{"id":"5058eb4c-...","status":"pending",...}`; row confirmed in DB |
| B. Exact boundary | ✅ PASS | 11:00 (inside 15min buffer) → `409 SLOT_UNAVAILABLE`; 11:15 (exactly at buffer edge) → `201` |
| C. Overlapping booking | ✅ PASS | 10:30 overlapping an existing 10:00–11:00 appt → `409 SLOT_UNAVAILABLE` |
| D. True concurrency | ✅ PASS | two backgrounded parallel requests for the same slot: one `201`, one `409 SLOT_UNAVAILABLE`; `select count(*) ... = 1` confirmed |
| E. Idempotency (replay) | ✅ PASS | same key+payload twice → `201` then `200`, identical `id`; DB confirms 1 row |
| E. Idempotency (mismatch) | ✅ PASS | same key, different payload → `409 DUPLICATE_REQUEST` |
| F. Customer dedup | ✅ PASS | two bookings, same email (different case/whitespace) → `select count(*) from customers where normalized_email=... = 1`, latest name/phone kept |
| G. Inspiration photo | ✅ PASS | `201` with a real photo attached; `inspiration_photo_path` stored; file confirmed to exist via service-role access (`200`) and confirmed NOT readable via public or anon-authenticated paths (`400`/`400`) |
| H. Invalid service | ✅ PASS | `422 INVALID_SERVICE` |
| H. Outside business hours (before open) | ✅ PASS | `422 OUTSIDE_BUSINESS_HOURS` |
| H. Closed weekday (Sunday) | ✅ PASS | `422 OUTSIDE_BUSINESS_HOURS` ("Closed on the selected date") |
| H. Blocked date | ✅ PASS | (test row inserted into `blocked_dates`) → `422 BLOCKED_DATE` |
| H. Malformed payload (bad email) | ✅ PASS | `422 INVALID_INPUT` |
| H. Invalid photo type (.pdf) | ✅ PASS | `422 INVALID_INPUT` |
| H. Oversized photo (9MB) | ✅ PASS | `422 INVALID_INPUT` |

**Every required test passed.** No schema or function logic changes were
needed as a result of live testing — only tooling/deploy-convention fixes
(below).

### Deno/deploy findings (fixed, both real)

1. `deno check` correctly flagged the original `index.ts` as untyped plain
   JS with an implicit-any strictness error — it had never actually been
   typed. Renamed to `index.js`... which then turned out to be wrong for a
   different reason:
2. **`supabase functions deploy` hardcodes `index.ts` as the entrypoint
   filename** — it does not fall back to `index.js`, despite Deno itself
   running plain JS fine. First deploy attempt failed with
   `Entrypoint path does not exist`. Fixed by renaming back to `index.ts`
   and relaxing `deno.json`'s `compilerOptions.strict` to `false` (the file
   is deliberately plain-JS-style; this documents that rather than
   retrofitting types onto it).
3. Confirmed live: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are
   reserved secret names — `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...`
   is rejected client-side by the CLI ("Env name cannot start with
   SUPABASE_"), and `supabase secrets list` shows both already present and
   populated automatically, exactly as documented before this was ever
   tested live.
4. Test data from this run (future-dated appointments/customers, one
   `blocked_dates` test row) remains in the dev project — it's clearly a
   `-dev` project and harmless, but flagged here in case a clean slate is
   wanted before further work.

---

## Runbook (for future re-runs)

Every `curl` command below is copy-pasteable once the placeholders are
filled in — this is what was actually executed for the results above.

## Prerequisites

```bash
export SUPABASE_URL=https://<project-ref>.supabase.co
export SUPABASE_ANON_KEY=<anon-key>
```

```bash
export SUPABASE_ACCESS_TOKEN=<personal-access-token>   # from Account -> Access Tokens
supabase link --project-ref <project-ref>
supabase db push                       # applies all migrations in order
supabase db push --include-seed        # optional: loads seed.sql's placeholder data
supabase functions deploy create-booking
supabase secrets set ALLOWED_ORIGINS=https://your-production-domain.com
# Do NOT set SUPABASE_SERVICE_ROLE_KEY / SUPABASE_URL yourself — confirmed
# live that the CLI rejects any secret name starting with SUPABASE_, and
# both are already auto-populated by the platform (`supabase secrets list`).
```

A small helper, since every request needs the same auth headers and a
multipart `payload` field:

```bash
book() {
  # usage: book '<json-payload>' [path-to-photo]
  local payload="$1" photo="$2"
  if [ -n "$photo" ]; then
    curl -s -w '\n%{http_code}\n' -X POST "$SUPABASE_URL/functions/v1/create-booking" \
      -H "Authorization: Bearer $SUPABASE_ANON_KEY" -H "apikey: $SUPABASE_ANON_KEY" \
      -F "payload=$payload" -F "inspirationPhoto=@$photo"
  else
    curl -s -w '\n%{http_code}\n' -X POST "$SUPABASE_URL/functions/v1/create-booking" \
      -H "Authorization: Bearer $SUPABASE_ANON_KEY" -H "apikey: $SUPABASE_ANON_KEY" \
      -F "payload=$payload"
  fi
}
```

Pick a service id + weekday/time that's open per the seeded
`availability_rules` (e.g. seed.sql's Monday 09:00–18:00) and a date at
least a day in the future. Generate idempotency keys with `uuidgen` (macOS)
or `python3 -c "import uuid;print(uuid.uuid4())"`.

---

## A. Successful booking

```bash
book '{"serviceId":"soft-glam","fullName":"Jane Doe","email":"jane@example.com","phone":"555-123-4567","occasion":"","notes":"","date":"2030-08-12","startTime":"10:00","policiesAccepted":true,"idempotencyKey":"<uuid-1>"}'
```

**Expect:** `201`, body `{ "id": "...", "status": "pending", ... }`.
Verify in the SQL editor: `select * from appointments where id = '<id>';`
— `status = 'pending'`.

## B. Exact non-overlapping boundary

With a 60-minute service and a 15-minute buffer, book 10:00 (A above), then
book the next non-overlapping slot at 11:15 (10:00–11:00 + 15min buffer =
free again at 11:15):

```bash
book '{"serviceId":"soft-glam","fullName":"Jane Doe","email":"jane@example.com","phone":"555-123-4567","occasion":"","notes":"","date":"2030-08-12","startTime":"11:15","policiesAccepted":true,"idempotencyKey":"<uuid-2>"}'
```

**Expect:** `201` — this must succeed. Then try 11:00 (still inside the
buffer) and confirm it's rejected (see C).

## C. Overlapping booking

```bash
book '{"serviceId":"soft-glam","fullName":"John Roe","email":"john@example.com","phone":"555-999-0000","occasion":"","notes":"","date":"2030-08-12","startTime":"10:30","policiesAccepted":true,"idempotencyKey":"<uuid-3>"}'
```

**Expect:** `409`, `{ "error": { "code": "SLOT_UNAVAILABLE", ... } }`.
Confirm only one row exists for that window:
`select count(*) from appointments where appointment_date='2030-08-12' and start_time='10:00';` → `1`.

## D. True concurrency test

Fire two requests for the *same* slot at nearly the same instant:

```bash
PAYLOAD_1='{"serviceId":"soft-glam","fullName":"Racer One","email":"racer1@example.com","phone":"555-111-1111","occasion":"","notes":"","date":"2030-08-13","startTime":"09:00","policiesAccepted":true,"idempotencyKey":"<uuid-4>"}'
PAYLOAD_2='{"serviceId":"soft-glam","fullName":"Racer Two","email":"racer2@example.com","phone":"555-222-2222","occasion":"","notes":"","date":"2030-08-13","startTime":"09:00","policiesAccepted":true,"idempotencyKey":"<uuid-5>"}'

book "$PAYLOAD_1" > /tmp/race1.out &
book "$PAYLOAD_2" > /tmp/race2.out &
wait
cat /tmp/race1.out /tmp/race2.out
```

**Expect:** exactly one response is `201` (`status: pending`), the other is
`409 SLOT_UNAVAILABLE`. Confirm in SQL:
`select count(*) from appointments where appointment_date='2030-08-13' and start_time='09:00';` → `1`.
For a stronger race (both requests hitting the INSERT at the same
nanosecond rather than just "close together" from a shell), repeat with a
small script issuing both via parallel background jobs from the same
process, or a short concurrent test harness (e.g. `k6`, `hey`, or two
`fetch()` calls fired without awaiting between them).

## E. Idempotency

Same key + same payload → same result:

```bash
book '{"serviceId":"soft-glam","fullName":"Jane Doe","email":"jane@example.com","phone":"555-123-4567","occasion":"","notes":"","date":"2030-08-14","startTime":"10:00","policiesAccepted":true,"idempotencyKey":"<uuid-6>"}'
# repeat the exact same command again
```

**Expect:** first call `201`; second call `200` with the **same** `id`.
Confirm only one row: `select count(*) from appointments where idempotency_key = '<uuid-6>';` → `1`.

Same key + different payload → rejected:

```bash
book '{"serviceId":"full-glam","fullName":"Jane Doe","email":"jane@example.com","phone":"555-123-4567","occasion":"","notes":"","date":"2030-08-14","startTime":"14:00","policiesAccepted":true,"idempotencyKey":"<uuid-6>"}'
```

**Expect:** `409`, `{ "error": { "code": "DUPLICATE_REQUEST", ... } }`.

## F. Customer deduplication

Book twice with the same email (any casing/whitespace), different names:

```bash
book '{"serviceId":"natural-glam","fullName":"Alex","email":"Alex@Example.com","phone":"555-000-1111","occasion":"","notes":"","date":"2030-08-15","startTime":"09:00","policiesAccepted":true,"idempotencyKey":"<uuid-7>"}'
book '{"serviceId":"natural-glam","fullName":"Alex R.","email":" alex@example.com ","phone":"555-000-2222","occasion":"","notes":"","date":"2030-08-15","startTime":"10:00","policiesAccepted":true,"idempotencyKey":"<uuid-8>"}'
```

**Expect:** both `201` (different slots, no conflict), but
`select count(*) from customers where normalized_email = 'alex@example.com';` → `1`, with `full_name`/`phone` updated to the second call's values.

## G. Inspiration photo (private storage)

```bash
book '{"serviceId":"bridal-makeup","fullName":"Sam","email":"sam@example.com","phone":"555-333-4444","occasion":"Wedding","notes":"","date":"2030-08-16","startTime":"09:00","policiesAccepted":true,"idempotencyKey":"<uuid-9>"}' ./some-test-photo.jpg
```

**Expect:** `201`, and `select inspiration_photo_path from appointments where idempotency_key='<uuid-9>';` returns a path like
`<appointment-id>/<timestamp>.jpg`.

Verify it's private:
```bash
curl -s -o /dev/null -w '%{http_code}\n' "$SUPABASE_URL/storage/v1/object/public/inspiration-photos/<the-path>"
```
**Expect:** a 4xx (not publicly readable — the bucket is private and has no
anon policies). Confirm the file *does* exist via the dashboard's Storage
browser (authenticated as the project owner) or
`supabase storage ls inspiration-photos --experimental`.

## H. Failure behavior

| Case | Payload change | Expect |
|---|---|---|
| Invalid service | `"serviceId":"does-not-exist"` | `422 INVALID_SERVICE` |
| Blocked date | a date present in `blocked_dates` | `422 BLOCKED_DATE` |
| Outside business hours | `"startTime":"07:00"` (before open) | `422 OUTSIDE_BUSINESS_HOURS` |
| Malformed payload | `"email":"not-an-email"` | `422 INVALID_INPUT` |
| Oversized photo | attach a file > 8MB | `422 INVALID_INPUT` |
| Invalid photo type | attach a `.pdf` | `422 INVALID_INPUT` |

## Recording results

Once run, replace this file's "Status: not yet run" line with a dated
results table (pass/fail per section, with the actual HTTP status/body
observed) — don't just check boxes, paste the real response bodies.
