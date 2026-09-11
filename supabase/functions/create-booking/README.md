# create-booking (Edge Function)

The only place an appointment is ever written. Runs server-side with the
Supabase service-role key — never exposed to the client, never a `VITE_*`
variable.

## Files

- `index.ts` — the Deno entrypoint (HTTP handling, Supabase queries/writes,
  Storage upload). Written in plain-JS style with no type annotations —
  `supabase functions deploy` hardcodes `index.ts` as the entrypoint
  filename (confirmed live; it does not fall back to `.js`), so it keeps
  the `.ts` extension with `deno.json`'s `compilerOptions.strict: false`
  rather than retrofitting types onto code that was never typed.
- `logic.js` — pure, dependency-free validation/computation logic used by
  `index.ts`. Deliberately has zero imports (not even from `src/`, since
  Vite's `@/` alias doesn't exist under Deno) so it can be — and is —
  imported directly by Vitest. See `logic.test.js`.
- `logic.test.js` — real, passing tests (`pnpm test`) for everything in
  `logic.js`: input validation, the availability re-check, hash-based
  idempotency comparison, Postgres-error-code mapping, and CORS
  origin-allowlist resolution.
- `deno.json` / `deno.lock` — declares the `@supabase/supabase-js` npm
  import as a bare specifier (Deno 2's linter requires this over an inline
  `npm:` specifier) and pins its resolved version.

## Verification status (Milestone 4C)

**Deployed and live-tested against a real Supabase project**
(`emma-cosmetics-dev`) — see `INTEGRATION_TESTING.md` for the full results:
every required test (successful booking, exact boundary, overlap
rejection, true concurrency, idempotency replay/mismatch, customer dedup,
private photo upload, and every failure case) passed for real, verified
against the live database. `deno lint`/`deno check` are also clean.

## Deploy

```bash
supabase functions deploy create-booking
supabase secrets set ALLOWED_ORIGINS=https://emmanuellesingani.com,https://www.emmanuellesingani.com
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-provided in every
Edge Function's environment by the Supabase platform — confirmed live that
the CLI actively rejects trying to set either yourself
(`supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...` errors with "Env name
cannot start with SUPABASE_"). `ALLOWED_ORIGINS` is NOT auto-provided — set
it once a production domain exists; local dev origins
(`localhost:5173`/`4173`) are always allowed regardless (see `logic.js`'s
`resolveAllowedOrigin`). There is no unrestricted `'*'` anywhere in this
function.

## What this milestone does NOT do

- No Stripe — payment fields are never read from the client, and every
  appointment this function creates starts as `status: 'pending'`.
- No confirmation email.
- No update/cancel endpoints — this function only ever inserts.

## Request contract

`POST /functions/v1/create-booking`, `multipart/form-data`:

- `payload` (required) — JSON string:
  ```json
  {
    "serviceId": "soft-glam",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "555-123-4567",
    "occasion": "Wedding",
    "notes": "",
    "date": "2030-08-13",
    "startTime": "13:30",
    "policiesAccepted": true,
    "idempotencyKey": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
  ```
- `inspirationPhoto` (optional) — a JPEG/PNG/WEBP/HEIC file, 8MB max.

Success: `201` (or `200` for an idempotent replay) with
`{ id, status, serviceId, date, startTime, endTime, photoWarning? }`.

Error: `{ error: { code, message, details? } }` — see the main project
README/milestone report for the full error code list.
