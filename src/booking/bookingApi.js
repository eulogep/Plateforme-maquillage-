// Clients for the booking-related Edge Functions — the only way this app
// ever writes an appointment or touches Stripe. No client code writes to
// `customers`, `appointments`, or Stripe directly; the browser never sees
// a Stripe secret key and never decides a charge amount (see
// supabase/functions/create-booking, create-payment-intent, stripe-webhook).
import { supabase, supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from '@/lib/supabaseClient'

export class BookingApiError extends Error {
  constructor(code, message, details) {
    super(message)
    this.name = 'BookingApiError'
    this.code = code
    this.details = details
  }
}

async function callEdgeFunction(functionName, { body, isFormData = false } = {}) {
  if (!isSupabaseConfigured) {
    throw new BookingApiError(
      'INTERNAL_ERROR',
      "Booking submission isn't connected yet — Supabase isn't configured in this environment."
    )
  }

  let response
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? body : JSON.stringify(body),
    })
  } catch {
    throw new BookingApiError('INTERNAL_ERROR', 'Could not reach the booking service. Check your connection and try again.')
  }

  let json = null
  try {
    json = await response.json()
  } catch {
    // fall through — json stays null, handled below
  }

  if (!response.ok) {
    const error = json?.error ?? {}
    throw new BookingApiError(
      error.code ?? 'INTERNAL_ERROR',
      error.message ?? 'Something went wrong. Please try again.',
      error.details
    )
  }

  return json
}

/**
 * @param {object} params
 * @param {object} params.payload - { serviceId, fullName, email, phone, occasion, notes, date (YYYY-MM-DD), startTime (HH:MM), policiesAccepted, idempotencyKey }
 * @param {File} [params.inspirationPhoto]
 */
export async function submitBooking({ payload, inspirationPhoto }) {
  const formData = new FormData()
  formData.append('payload', JSON.stringify(payload))
  if (inspirationPhoto) {
    formData.append('inspirationPhoto', inspirationPhoto)
  }
  return callEdgeFunction('create-booking', { body: formData, isFormData: true })
}

/**
 * Creates (or safely reuses) a Stripe PaymentIntent for an existing,
 * still-payable appointment. Returns only a client_secret — never an
 * amount the client chose, and never anything indicating payment or
 * confirmation on its own.
 */
export async function createPaymentIntent(appointmentId) {
  return callEdgeFunction('create-payment-intent', { body: { appointmentId } })
}

/**
 * Narrow, safe status read for polling after payment submission. Only
 * ever returns { status, payment_status } for one appointment id the
 * caller already possesses — see get_booking_status() in the Milestone 5
 * migration. This is the ONLY way the client learns an appointment is
 * confirmed; nothing here or in the UI sets that status itself.
 */
export async function getBookingStatus(appointmentId) {
  if (!isSupabaseConfigured) {
    throw new BookingApiError('INTERNAL_ERROR', "Status check isn't connected — Supabase isn't configured.")
  }
  const { data, error } = await supabase.rpc('get_booking_status', { p_appointment_id: appointmentId })
  if (error) {
    throw new BookingApiError('INTERNAL_ERROR', 'Could not check booking status.')
  }
  const row = Array.isArray(data) ? data[0] : data
  return row ?? null
}

export function generateIdempotencyKey() {
  return crypto.randomUUID()
}
