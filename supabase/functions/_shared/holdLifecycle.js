// Booking hold lifecycle helpers, shared by create-booking,
// create-payment-intent, and stripe-webhook.
//
// The hold duration is TECHNICAL/TEST configuration, not an Emmanuelle
// business policy — 15 minutes is a reasonable development default.
// Override via the HOLD_DURATION_MINUTES environment variable once a real
// value is decided (e.g. `supabase secrets set HOLD_DURATION_MINUTES=10`).
export const DEFAULT_HOLD_DURATION_MINUTES = 15

export function resolveHoldDurationMinutes(envValue) {
  const parsed = Number(envValue)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_HOLD_DURATION_MINUTES
}

export function computeHoldExpiresAt(now = new Date(), holdDurationMinutes = DEFAULT_HOLD_DURATION_MINUTES) {
  return new Date(now.getTime() + holdDurationMinutes * 60_000)
}

export function isHoldExpired(holdExpiresAt, now = new Date()) {
  if (!holdExpiresAt) return false
  const expiresAt = holdExpiresAt instanceof Date ? holdExpiresAt : new Date(holdExpiresAt)
  return expiresAt.getTime() <= now.getTime()
}

/**
 * Flips any stale pending/payment_pending row(s) past their hold_expires_at
 * to 'expired', so they stop occupying the slot — the exclusion constraint
 * is scoped to pending/payment_pending/confirmed, so an 'expired' row no
 * longer blocks anything. Since an exclusion constraint's predicate can't
 * reference now(), the actual moment of release is whenever this sweep
 * runs — called opportunistically at the top of create-booking (global
 * sweep) and create-payment-intent (scoped to one appointment) rather than
 * relying on a background job.
 *
 * @param {object} supabaseAdmin - a Supabase client authenticated with the
 *   service role (this bypasses RLS, same as everything else these
 *   functions do).
 * @param {string|null} appointmentId - scope the sweep to one row; omit
 *   for a global sweep.
 */
export async function expireStaleHolds(supabaseAdmin, appointmentId = null) {
  let query = supabaseAdmin
    .from('appointments')
    .update({ status: 'expired' })
    .in('status', ['pending', 'payment_pending'])
    .lt('hold_expires_at', new Date().toISOString())

  if (appointmentId) {
    query = query.eq('id', appointmentId)
  }

  const { error } = await query
  if (error) throw error
}
