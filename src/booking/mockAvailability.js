// Mock availability data + queries for the booking flow (Milestone 3 —
// booking UI only, no backend yet).
//
// IMPORTANT: everything in this file is placeholder/test data for building
// and validating the UI. None of it reflects Emmanuelle's real business
// hours, blocked dates, or existing appointments — those are not yet
// confirmed (see src/config/business.js). Every exported query function is
// async and returns data shaped the way a real Supabase-backed version
// would, specifically so the UI layer doesn't need to change when this file
// is swapped for real queries in a later milestone.

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
// state the way it will need to once this is backed by a real API.
const MOCK_LATENCY_MS = 350

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function toHHMM(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function dateKey(date) {
  const d = date instanceof Date ? date : new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Synchronous day-level check used to disable calendar days. Real business
 * hours are unconfirmed — see the placeholder note above.
 */
export function isDateAvailableSync(date) {
  const d = date instanceof Date ? date : new Date(date)
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  if (d < startOfToday) return false
  if (MOCK_BLOCKED_DATES.has(dateKey(d))) return false
  return MOCK_BUSINESS_HOURS[d.getDay()] !== null
}

/**
 * Async wrapper kept for parity with what a real availability check will
 * look like once it has to hit a server.
 */
export async function isDateAvailable(date) {
  await delay(MOCK_LATENCY_MS)
  return isDateAvailableSync(date)
}

/**
 * Returns the bookable time slots for a given date + service duration,
 * accounting for business hours, a buffer between appointments, and
 * existing (mock) appointments. Past times on the current day are excluded.
 */
export async function getAvailableTimeSlots(date, serviceDurationMinutes) {
  await delay(MOCK_LATENCY_MS)

  const d = date instanceof Date ? date : new Date(date)
  const hours = MOCK_BUSINESS_HOURS[d.getDay()]
  if (!hours || MOCK_BLOCKED_DATES.has(dateKey(d))) return []

  const openMin = toMinutes(hours.open)
  const closeMin = toMinutes(hours.close)
  const key = dateKey(d)

  const bookedRanges = MOCK_EXISTING_APPOINTMENTS.filter((a) => a.date === key).map((a) => {
    const start = toMinutes(a.time)
    return { start, end: start + a.durationMinutes + BUFFER_MINUTES }
  })

  const now = new Date()
  const isToday = dateKey(now) === key
  const nowMin = now.getHours() * 60 + now.getMinutes()

  const slots = []
  for (let start = openMin; start + serviceDurationMinutes <= closeMin; start += SLOT_INTERVAL_MINUTES) {
    const end = start + serviceDurationMinutes
    if (isToday && start <= nowMin) continue

    const overlapsExisting = bookedRanges.some((r) => start < r.end && end > r.start)
    if (overlapsExisting) continue

    slots.push(toHHMM(start))
  }

  return slots
}

export const bookingConstants = {
  SLOT_INTERVAL_MINUTES,
  BUFFER_MINUTES,
}
