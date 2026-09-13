// Generates a real, downloadable .ics calendar file for a confirmed
// booking. Pure and testable — no fetch, no DOM. Anchors the appointment's
// wall-clock date/time to the business timezone explicitly
// (date-fns-tz's fromZonedTime), never the visitor's browser timezone, then
// emits UTC ("Z") timestamps so every calendar app displays the correct
// local time for whoever imports it, regardless of their own timezone.
import { fromZonedTime } from 'date-fns-tz'

function toIcsUtcStamp(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function escapeIcsText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * @param {object} params
 * @param {string} params.serviceName
 * @param {string} params.businessName
 * @param {string} params.dateStr - "YYYY-MM-DD", business-local calendar date
 * @param {string} params.startTime - "HH:MM", business-local wall clock
 * @param {number} params.durationMinutes
 * @param {string} params.timezone - IANA zone, e.g. "America/New_York"
 * @param {string} params.locationLine
 * @param {string} params.reference - appointment id; used only as a UID/description value, never a secret
 * @returns {string} the .ics file content
 */
export function generateIcs({
  serviceName,
  businessName,
  dateStr,
  startTime,
  durationMinutes,
  timezone,
  locationLine,
  reference,
}) {
  if (!dateStr || !startTime || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    throw new Error('generateIcs: dateStr, startTime, and a positive durationMinutes are required')
  }

  const startUtc = fromZonedTime(`${dateStr}T${startTime}:00`, timezone)
  const endUtc = new Date(startUtc.getTime() + durationMinutes * 60_000)

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Emmanuelle Singani//Booking//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${reference}@emmanuellesingani-booking`,
    `DTSTAMP:${toIcsUtcStamp(new Date())}`,
    `DTSTART:${toIcsUtcStamp(startUtc)}`,
    `DTEND:${toIcsUtcStamp(endUtc)}`,
    `SUMMARY:${escapeIcsText(`${serviceName} — ${businessName}`)}`,
    `LOCATION:${escapeIcsText(locationLine)}`,
    `DESCRIPTION:${escapeIcsText(`Booking reference: ${reference}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

export function downloadIcs(icsContent, filename = 'appointment.ics') {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
