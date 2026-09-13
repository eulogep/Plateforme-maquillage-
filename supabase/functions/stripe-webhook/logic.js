// Pure, runtime-agnostic decision logic for the Stripe webhook handler.
// Zero imports — same rationale as the other functions' logic.js files.
// index.ts does signature verification, DB I/O, and Stripe SDK calls;
// every actual DECISION (confirm vs. record-exception vs. no-op) lives
// here so it's fully unit-testable without a real webhook request.

export class AppError extends Error {
  constructor(code, message, details) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
  }
}

export function extractAppointmentId(paymentIntent) {
  return paymentIntent?.metadata?.appointment_id ?? null
}

/**
 * Decides what to do with a payment_intent.succeeded event, given the
 * appointment's current DB state. Never mutates anything — index.ts acts
 * on the returned decision. This is where the "expired hold + late
 * successful payment" policy (Milestone 5, section 7) is actually decided:
 * anything other than a still-live payment_pending hold, still within its
 * hold window, with the exact expected amount, becomes a payment
 * exception requiring manual resolution — never a silently confirmed
 * booking.
 *
 * @param {object} params
 * @param {object|null} params.appointment - the DB row, or null if not found
 * @param {number} params.paidAmountCents - amount actually charged, from Stripe
 * @param {(holdExpiresAt: string|null) => boolean} params.isHoldExpired
 * @returns {{ action: 'confirm'|'noop'|'record_exception', reason: string }}
 */
export function decideSucceededOutcome({ appointment, paidAmountCents, isHoldExpired }) {
  if (!appointment) {
    return { action: 'record_exception', reason: 'appointment_not_found' }
  }
  if (appointment.status === 'confirmed') {
    // Redelivered event for an already-confirmed booking — safe no-op.
    return { action: 'noop', reason: 'already_confirmed' }
  }
  if (appointment.status === 'payment_pending') {
    if (isHoldExpired(appointment.hold_expires_at)) {
      return { action: 'record_exception', reason: 'hold_expired_before_confirmation' }
    }
    if (paidAmountCents !== appointment.amount_due_now_cents) {
      return { action: 'record_exception', reason: 'amount_mismatch' }
    }
    return { action: 'confirm', reason: 'payment_verified' }
  }
  // pending / cancelled / expired / completed / no_show: the hold this
  // payment was for is no longer live-and-payable. Per the documented
  // policy, we never resurrect it — even if the slot happens to still be
  // technically free — because doing so would bypass the same
  // re-validation every other booking goes through. Record an exception
  // for manual resolution (refund, or manual re-booking) instead.
  return { action: 'record_exception', reason: `appointment_status_${appointment.status}` }
}

/**
 * payment_intent.payment_failed / .canceled — only ever updates
 * payment_status, and only while the appointment is still payment_pending
 * (a terminal appointment shouldn't have its payment_status churned by a
 * late-arriving event for an intent that no longer matters).
 */
export function decideFailureOutcome({ appointment, newPaymentStatus }) {
  if (!appointment) {
    return { action: 'noop', reason: 'appointment_not_found' }
  }
  if (appointment.status !== 'payment_pending') {
    return { action: 'noop', reason: `appointment_status_${appointment.status}` }
  }
  return { action: 'update_payment_status', reason: 'stripe_reported', newPaymentStatus }
}
