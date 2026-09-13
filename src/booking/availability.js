// Real, Supabase-backed availability queries. This is what
// DateTimeStep.jsx actually imports — it silently falls back to
// src/booking/mockAvailability.js whenever Supabase isn't configured
// (missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY) or a query fails, so
// local development and this milestone's UI keep working either way.
//
// READ-SIDE ONLY: the slots this returns are advisory for the UI. They are
// NOT the final word on whether a slot can be booked — two people could
// both see the same open slot and both try to take it. Preventing that
// (atomic creation, server-side re-validation, real no-double-booking
// guarantees) is Milestone 4B, not this file.
//
// All date/time handling here uses the business's timezone explicitly
// (src/config/business.js -> location.timezone), never the visitor's
// browser timezone — see dateKeyInTz/weekdayInTz/nowMinutesInTz below.
import { formatInTimeZone } from 'date-fns-tz'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { business } from '@/config/business'
import { computeAvailableSlots, timeToMinutes } from './slotMath'
import * as mock from './mockAvailability'

const TIMEZONE = business.location.timezone

const WEEKDAY_NAME_TO_NUMBER = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

function dateKeyInTz(date) {
  return formatInTimeZone(date, TIMEZONE, 'yyyy-MM-dd')
}

function weekdayInTz(date) {
  return WEEKDAY_NAME_TO_NUMBER[formatInTimeZone(date, TIMEZONE, 'EEEE')]
}

function nowMinutesInTz() {
  const now = new Date()
  const hh = Number(formatInTimeZone(now, TIMEZONE, 'HH'))
  const mm = Number(formatInTimeZone(now, TIMEZONE, 'mm'))
  return hh * 60 + mm
}

// Postgres `time` columns come back as "HH:MM:SS" — trim to "HH:MM" to
// match what slotMath expects.
function toHHMM(pgTime) {
  return pgTime ? pgTime.slice(0, 5) : pgTime
}

let warned = false
function warnFallback(reason) {
  if (!warned) {
    console.warn(
      `[booking] Falling back to mock availability data (${reason}). See supabase/README.md and .env.example.`
    )
    warned = true
  }
}

/**
 * Loads the full weekly schedule + blocked dates in two small queries, so
 * the calendar's day-disabling can stay a synchronous predicate after one
 * upfront fetch (react-day-picker's `disabled` matcher can't be async).
 * Shape matches mockAvailability.loadAvailabilityContext() exactly.
 */
export async function loadAvailabilityContext() {
  if (!isSupabaseConfigured) {
    warnFallback('Supabase is not configured')
    return mock.loadAvailabilityContext()
  }

  try {
    const [rulesResult, blockedResult] = await Promise.all([
      supabase.from('availability_rules').select('weekday,is_closed,open_time,close_time,buffer_minutes'),
      supabase.from('blocked_dates').select('blocked_date'),
    ])
    if (rulesResult.error) throw rulesResult.error
    if (blockedResult.error) throw blockedResult.error

    const rulesByWeekday = {}
    for (const row of rulesResult.data ?? []) {
      rulesByWeekday[row.weekday] = row.is_closed
        ? { isClosed: true }
        : {
            isClosed: false,
            open: toHHMM(row.open_time),
            close: toHHMM(row.close_time),
            bufferMinutes: row.buffer_minutes,
          }
    }

    const blockedDates = new Set((blockedResult.data ?? []).map((row) => row.blocked_date))
    return { rulesByWeekday, blockedDates }
  } catch (err) {
    warnFallback(err?.message ?? 'availability_rules/blocked_dates query failed')
    return mock.loadAvailabilityContext()
  }
}

/**
 * Pure, synchronous predicate over an already-loaded context — this is what
 * DateTimeStep passes to the Calendar's `disabled` matcher after calling
 * loadAvailabilityContext() once on mount.
 */
export function isDateAvailableFromContext(date, context) {
  if (!context) return false

  const todayKey = dateKeyInTz(new Date())
  const dateKey = dateKeyInTz(date)
  if (dateKey < todayKey) return false
  if (context.blockedDates.has(dateKey)) return false

  const rule = context.rulesByWeekday[weekdayInTz(date)]
  return Boolean(rule && !rule.isClosed)
}

/** Single-date async check, kept for parity/reuse (e.g. a later re-validation step). */
export async function isDateAvailable(date) {
  const context = await loadAvailabilityContext()
  return isDateAvailableFromContext(date, context)
}

/**
 * Real bookable time slots for one date: business hours + buffer for that
 * weekday, minus existing appointments (read through the PII-free
 * `appointment_busy_windows` view), minus past times if the date is today
 * (all computed in the business timezone).
 */
export async function getAvailableTimeSlots(date, durationMinutes) {
  if (!isSupabaseConfigured) {
    warnFallback('Supabase is not configured')
    return mock.getAvailableTimeSlots(date, durationMinutes)
  }

  const dateKey = dateKeyInTz(date)
  const weekday = weekdayInTz(date)

  try {
    const [ruleResult, busyResult, blockedResult] = await Promise.all([
      supabase
        .from('availability_rules')
        .select('is_closed,open_time,close_time,buffer_minutes')
        .eq('weekday', weekday)
        .maybeSingle(),
      supabase.from('appointment_busy_windows').select('start_time,end_time').eq('appointment_date', dateKey),
      supabase.from('blocked_dates').select('blocked_date').eq('blocked_date', dateKey).maybeSingle(),
    ])
    if (ruleResult.error) throw ruleResult.error
    if (busyResult.error) throw busyResult.error
    if (blockedResult.error) throw blockedResult.error

    const rule = ruleResult.data
    if (!rule || rule.is_closed || blockedResult.data) return []

    const busyRanges = (busyResult.data ?? []).map((row) => ({
      start: timeToMinutes(toHHMM(row.start_time)),
      end: timeToMinutes(toHHMM(row.end_time)),
    }))

    return computeAvailableSlots({
      openTime: toHHMM(rule.open_time),
      closeTime: toHHMM(rule.close_time),
      durationMinutes,
      bufferMinutes: rule.buffer_minutes,
      busyRanges,
      slotIntervalMinutes: mock.bookingConstants.SLOT_INTERVAL_MINUTES,
      isToday: dateKey === dateKeyInTz(new Date()),
      nowMinutes: nowMinutesInTz(),
    })
  } catch (err) {
    warnFallback(err?.message ?? 'availability query failed')
    return mock.getAvailableTimeSlots(date, durationMinutes)
  }
}

export const bookingConstants = mock.bookingConstants
