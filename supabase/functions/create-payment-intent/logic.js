// Pure, runtime-agnostic logic for create-payment-intent. Same rationale as
// supabase/functions/create-booking/logic.js: zero imports so it works
// identically under Deno (the real function) and Node (Vitest).

export class AppError extends Error {
  constructor(code, message, details) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function validateInput(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new AppError('INVALID_INPUT', 'Request body must be a JSON object')
  }
  const appointmentId = raw.appointmentId
  if (typeof appointmentId !== 'string' || !UUID_RE.test(appointmentId)) {
    throw new AppError('INVALID_INPUT', 'appointmentId must be a UUID', { field: 'appointmentId' })
  }
  return { appointmentId }
}

// Statuses that mean "still eligible to pay for this appointment".
const PAYABLE_STATUSES = ['pending', 'payment_pending']

// Stripe PaymentIntent statuses that mean "safe to reuse — the customer
// hasn't paid yet, so a fresh client_secret for the SAME intent is fine".
const REUSABLE_STRIPE_STATUSES = ['requires_payment_method', 'requires_confirmation', 'requires_action', 'processing']

/**
 * Decides whether the appointment is still eligible for a payment attempt.
 * Throws a structured AppError otherwise.
 */
export function assertAppointmentPayable(appointment) {
  if (!appointment) {
    throw new AppError('APPOINTMENT_NOT_FOUND', 'Booking not found')
  }
  if (!PAYABLE_STATUSES.includes(appointment.status)) {
    throw new AppError(
      'INVALID_APPOINTMENT_STATE',
      `This booking is ${appointment.status} and can no longer be paid for`,
      { status: appointment.status }
    )
  }
}

export function shouldReuseExistingIntent(stripeStatus) {
  return REUSABLE_STRIPE_STATUSES.includes(stripeStatus)
}

export function buildIdempotencyKey(appointmentId) {
  return `create-payment-intent:${appointmentId}`
}

/** Maps a caught error to the app's error contract. */
export function mapDatabaseError(error) {
  return new AppError('INTERNAL_ERROR', 'Something went wrong. Please try again.', {
    cause: error?.message,
  })
}
