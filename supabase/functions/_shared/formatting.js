// Small display-formatting helpers, duplicated intentionally from
// src/booking/bookingUtils.js (same rationale as BUSINESS_TIMEZONE in
// create-booking/index.ts — Deno functions can't cross the Vite "@/" alias
// boundary). appointment_date/start_time are already stored as
// business-local wall-clock strings (see create-booking), so these are
// pure string reformatting — no timezone conversion needed here.

/** "2030-08-13" -> "Aug 13, 2030" */
export function formatDateLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

/** "13:30" -> "1:30 PM" */
export function formatTimeLabel(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

/** "+15712669829" -> "(571) 266-9829". Returns the input unchanged if it
 * isn't a recognizable 10-digit US number, rather than mangling it. */
export function formatPhoneLabel(e164) {
  if (!e164) return e164
  const digits = e164.replace(/\D/g, '').replace(/^1/, '')
  if (digits.length !== 10) return e164
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}
