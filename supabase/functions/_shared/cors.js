// Shared CORS allow-list logic for create-payment-intent and stripe-webhook.
// (create-booking has its own copy of this same function in its logic.js —
// predates this shared module and is already deployed/tested; not moved
// here to avoid touching a stable, live-verified function without need.)
export const DEFAULT_DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173']

/**
 * Reflects the request's Origin header back only if it's on the allow-list
 * — never a bare '*'. See create-booking/logic.js's identical function for
 * full rationale.
 */
export function resolveAllowedOrigin(requestOrigin, extraOriginsEnv = '') {
  if (!requestOrigin) return null
  const configured = extraOriginsEnv
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
  const allowed = new Set([...DEFAULT_DEV_ORIGINS, ...configured])
  return allowed.has(requestOrigin) ? requestOrigin : null
}

export function corsHeaders(requestOrigin, allowedOriginsEnv, extraHeaders = 'authorization, x-client-info, apikey, content-type') {
  const allowOrigin = resolveAllowedOrigin(requestOrigin, allowedOriginsEnv ?? '')
  return {
    ...(allowOrigin ? { 'Access-Control-Allow-Origin': allowOrigin, Vary: 'Origin' } : {}),
    'Access-Control-Allow-Headers': extraHeaders,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}
