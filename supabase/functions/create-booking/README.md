# create-booking (Edge Function)

The only place an appointment is ever written. Runs server-side with the
Supabase service-role key — never exposed to the client, never a `VITE_*`
variable.

## Files

- `index.ts` — the Deno entrypoint (HTTP handling, Supabase queries/writes,
  Storage upload). **Not runnable in this repo's environment** — no Deno
  runtime and no live Supabase project are available here, so this file has
  not been executed. Deploy it and exercise it via `supabase functions
  serve` / a real project.
- `logic.js` — pure, dependency-free validation/computation logic used by
  `index.ts`. Deliberately has zero imports (not even from `src/`, since
  Vite's `@/` alias doesn't exist under Deno) so it can be — and is —
  imported directly by Vitest. See `logic.test.js`.
- `logic.test.js` — real, passing tests (`pnpm test`) for everything in
  `logic.js`: input validation, the availability re-check, hash-based
  idempotency comparison, and Postgres-error-code mapping.

## Deploy

```bash
supabase functions deploy create-booking
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are also auto-provided in
every Edge Function's environment by the Supabase platform itself — the
explicit `supabase secrets set` above is only needed for local
`functions serve`.

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
