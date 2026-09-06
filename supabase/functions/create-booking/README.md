# create-booking (Edge Function)

The only place an appointment is ever written. Runs server-side with the
Supabase service-role key — never exposed to the client, never a `VITE_*`
variable.

## Files

- `index.js` — the Deno entrypoint (HTTP handling, Supabase queries/writes,
  Storage upload). Plain JS, not TypeScript (it was briefly named
  `index.ts` with no type annotations — `deno check` correctly flagged
  that as untyped, so it's named accurately now).
- `logic.js` — pure, dependency-free validation/computation logic used by
  `index.js`. Deliberately has zero imports (not even from `src/`, since
  Vite's `@/` alias doesn't exist under Deno) so it can be — and is —
  imported directly by Vitest. See `logic.test.js`.
- `logic.test.js` — real, passing tests (`pnpm test`) for everything in
  `logic.js`: input validation, the availability re-check, hash-based
  idempotency comparison, Postgres-error-code mapping, and CORS
  origin-allowlist resolution.
- `deno.json` — declares the `@supabase/supabase-js` npm import as a bare
  specifier (Deno 2's linter requires this over an inline `npm:` specifier).

## Deno runtime verification done in this repo (Milestone 4C)

Deno was installed locally and used to verify, without needing a live
project:
- `deno lint index.js logic.js` — clean.
- `deno check index.js` — clean (imports/types resolve).

**Not verified here** (needs a real Supabase project — no Docker/live
project available in this environment): the function actually starting via
`supabase functions serve`, environment variables being populated at
runtime, and a real end-to-end HTTP request/response including the
Supabase admin client and Storage upload. See the milestone report for the
exact remaining verification steps.

## Deploy

```bash
supabase functions deploy create-booking
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
supabase secrets set ALLOWED_ORIGINS=https://emmanuellesingani.com,https://www.emmanuellesingani.com
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are also auto-provided in
every Edge Function's environment by the Supabase platform itself — the
explicit `supabase secrets set` above is only needed for local
`functions serve`. `ALLOWED_ORIGINS` is NOT auto-provided — set it once a
production domain exists; local dev origins (`localhost:5173`/`4173`) are
always allowed regardless (see `logic.js`'s `resolveAllowedOrigin`). There
is no unrestricted `'*'` anywhere in this function.

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
