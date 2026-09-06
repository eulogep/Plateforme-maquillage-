// Client for the create-booking Edge Function — the only way this app ever
// writes an appointment. No client code writes to `customers` or
// `appointments` directly (both are locked down by RLS; see
// supabase/migrations/).
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from '@/lib/supabaseClient'

export class BookingApiError extends Error {
  constructor(code, message, details) {
    super(message)
    this.name = 'BookingApiError'
    this.code = code
    this.details = details
  }
}

/**
 * @param {object} params
 * @param {object} params.payload - { serviceId, fullName, email, phone, occasion, notes, date (YYYY-MM-DD), startTime (HH:MM), policiesAccepted, idempotencyKey }
 * @param {File} [params.inspirationPhoto]
 */
export async function submitBooking({ payload, inspirationPhoto }) {
  if (!isSupabaseConfigured) {
    throw new BookingApiError(
      'INTERNAL_ERROR',
      "Booking submission isn't connected yet — Supabase isn't configured in this environment."
    )
  }

  const formData = new FormData()
  formData.append('payload', JSON.stringify(payload))
  if (inspirationPhoto) {
    formData.append('inspirationPhoto', inspirationPhoto)
  }

  let response
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/create-booking`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
      body: formData,
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

export function generateIdempotencyKey() {
  return crypto.randomUUID()
}
