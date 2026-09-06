// Mock availability data + queries — the fallback used when Supabase isn't
// configured (see src/booking/availability.js), and the data source for
// local development without a Supabase project.
//
// IMPORTANT: everything in this file is placeholder/test data. None of it
// reflects Emmanuelle's real business hours, blocked dates, or existing
// appointments — those are not yet confirmed (see src/config/business.js).
// Function signatures intentionally match src/booking/availability.js so
// DateTimeStep.jsx can't tell which one it's talking to.

import { computeAvailableSlots, timeToMinutes } from './slotMath'

// Mon–Sat, 9am–6pm; closed Sundays. Placeholder only.
const MOCK_BUSINESS_HOURS = {
  0: null, // Sunday — closed
  1: { open: '09:00', close: '18:00' },
  2: { open: '09:00', close: '18:00' },
  3: { open: '09:00', close: '18:00' },
  4: { open: '09:00', close: '18:00' },
  5: { open: '09:00', close: '18:00' },
  6: { open: '10:00', close: '16:00' },
}

// A couple of fully-blocked dates (e.g. holidays, days off) — placeholder.
const MOCK_BLOCKED_DATES = new Set([])

// Simulated already-booked appointments, so the slot picker has something to
// filter out and demonstrate no-double-booking behavior. Placeholder only.
const MOCK_EXISTING_APPOINTMENTS = [
  // { date: '2026-08-13', time: '13:30', durationMinutes: 60 },
]

const SLOT_INTERVAL_MINUTES = 30
const BUFFER_MINUTES = 15
// Simulated network latency so the UI already handles an async/loading
// state the way it needs to for the real Supabase-backed version.
const MOCK_LATENCY_MS = 350

function dateKey(date) {
  const d = date instanceof Date ? date : new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Synchronous day-level check. Used as the fallback behind
 * loadAvailabilityContext() in availability.js, and directly by anything
 * that hasn't migrated (kept for backwards compatibility).
 */
export function isDateAvailableSync(date) {
  const d = date instanceof Date ? date : new Date(date)
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  if (d < startOfToday) return false
  if (MOCK_BLOCKED_DATES.has(dateKey(d))) return false
  return MOCK_BUSINESS_HOURS[d.getDay()] !== null
}

export async function isDateAvailable(date) {
  await delay(MOCK_LATENCY_MS)
  return isDateAvailableSync(date)
}

export async function getAvailableTimeSlots(date, serviceDurationMinutes) {
  await delay(MOCK_LATENCY_MS)

  const d = date instanceof Date ? date : new Date(date)
  const hours = MOCK_BUSINESS_HOURS[d.getDay()]
  if (!hours || MOCK_BLOCKED_DATES.has(dateKey(d))) return []

  const key = dateKey(d)
  const busyRanges = MOCK_EXISTING_APPOINTMENTS.filter((a) => a.date === key).map((a) => {
    const start = timeToMinutes(a.time)
    return { start, end: start + a.durationMinutes }
  })

  const now = new Date()
  const isToday = dateKey(now) === key

  return computeAvailableSlots({
    openTime: hours.open,
    closeTime: hours.close,
    durationMinutes: serviceDurationMinutes,
    bufferMinutes: BUFFER_MINUTES,
    busyRanges,
    slotIntervalMinutes: SLOT_INTERVAL_MINUTES,
    isToday,
    nowMinutes: now.getHours() * 60 + now.getMinutes(),
  })
}

/**
 * Returns the same rules/blocked-dates shape availability.js builds from
 * Supabase, so DateTimeStep can use one code path regardless of which
 * backend is active.
 */
export async function loadAvailabilityContext() {
  await delay(MOCK_LATENCY_MS)
  const rulesByWeekday = {}
  for (const [weekday, hours] of Object.entries(MOCK_BUSINESS_HOURS)) {
    rulesByWeekday[Number(weekday)] = hours
      ? { isClosed: false, open: hours.open, close: hours.close, bufferMinutes: BUFFER_MINUTES }
      : { isClosed: true }
  }
  return { rulesByWeekday, blockedDates: MOCK_BLOCKED_DATES }
}

export const bookingConstants = {
  SLOT_INTERVAL_MINUTES,
  BUFFER_MINUTES,
}
