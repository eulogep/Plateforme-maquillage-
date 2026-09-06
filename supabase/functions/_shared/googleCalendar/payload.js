// Pure Google Calendar helpers — no network/DB, fully unit-testable.

/**
 * @param {{clientId?: string, clientSecret?: string, refreshToken?: string, calendarId?: string}} env
 */
export function isGoogleCalendarConfigured(env) {
  return Boolean(env?.clientId && env?.clientSecret && env?.refreshToken && env?.calendarId)
}

/**
 * Builds the Calendar API v3 event resource for a confirmed appointment.
 * start/end are naive local datetime strings ("2030-08-13T13:30:00", no
 * offset/Z) paired with an explicit `timeZone` IANA name — this is Google
 * Calendar API's documented way to specify wall-clock time in the
 * business timezone explicitly, without doing a UTC conversion ourselves
 * (Google handles that using its own DST-aware tz database). See
 * computeGoogleEventTimes() below for how startIso/endIso get produced.
 */
export function buildCalendarEventPayload({
  serviceName,
  customerName,
  startIso,
  endIso,
  timezone,
  locationLine,
  reference,
}) {
  if (!serviceName || !startIso || !endIso || !timezone) {
    throw new Error('buildCalendarEventPayload: serviceName, startIso, endIso, and timezone are required')
  }
  return {
    summary: `${serviceName}${customerName ? ` — ${customerName}` : ''}`,
    location: locationLine || undefined,
    description: reference ? `Booking reference: ${reference}` : undefined,
    start: { dateTime: startIso, timeZone: timezone },
    end: { dateTime: endIso, timeZone: timezone },
  }
}

/**
 * Computes the naive local datetime strings Google Calendar expects for
 * start/end, from the appointment's business-local date/time + duration.
 * Pure date-component arithmetic (via a UTC-labelled scratch Date used
 * only to get correct day/month rollover for free) — never a genuine
 * timezone conversion, since Google wants wall-clock values paired with a
 * timeZone field, not a UTC instant.
 *
 * @param {string} dateStr - "YYYY-MM-DD"
 * @param {string} startTime - "HH:MM" or "HH:MM:SS"
 * @param {number} durationMinutes
 */
export function computeGoogleEventTimes(dateStr, startTime, durationMinutes) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hour, minute] = startTime.slice(0, 5).split(':').map(Number)
  const pad = (n) => String(n).padStart(2, '0')

  const start = new Date(Date.UTC(year, month - 1, day, hour, minute))
  const end = new Date(start.getTime() + durationMinutes * 60_000)
  const toNaiveIso = (d) =>
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:00`

  return { startIso: toNaiveIso(start), endIso: toNaiveIso(end) }
}

/**
 * Given the existing calendar_events row (or null) for an appointment,
 * decides whether to create a new event, skip (already created), or retry
 * a previous failure. Same idempotency shape as the notification decision
 * logic — a unique (appointment_id) constraint at the DB level is the
 * actual guarantee; this just decides intent before that.
 */
export function decideCalendarSyncAction(existingRow) {
  if (!existingRow) return 'create'
  if (existingRow.status === 'created') return 'skip'
  return 'create' // 'pending' or 'failed' — safe to retry
}
