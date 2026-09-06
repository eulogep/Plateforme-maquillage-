// Pure helper functions for the booking flow. Business data (services,
// pricing, deposit) is read from src/config/business.js, never duplicated
// here.
import { formatInTimeZone } from 'date-fns-tz'
import { services, addOnServices, business } from '@/config/business'

const allServices = [...services, ...addOnServices]

export function getServiceById(serviceId) {
  return allServices.find((s) => s.id === serviceId) ?? null
}

export function formatPrice(amount) {
  return `$${amount}`
}

export function formatDateLong(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatTimeLabel(hhmm) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

/**
 * Duration string like "60 min" -> 60. Falls back to 60 if unparseable so
 * slot math never breaks on unexpected data.
 */
export function parseDurationMinutes(durationLabel) {
  const match = /(\d+)/.exec(durationLabel ?? '')
  return match ? Number(match[1]) : 60
}

/**
 * "YYYY-MM-DD" in the business timezone — what the create-booking Edge
 * Function expects for `date`. Never the browser's local timezone.
 */
export function formatDateKeyInBusinessTimezone(date) {
  if (!date) return ''
  return formatInTimeZone(date, business.location.timezone, 'yyyy-MM-dd')
}

export const bookingSteps = [
  { id: 'service', label: 'Service' },
  { id: 'datetime', label: 'Date & Time' },
  { id: 'client', label: 'Client Details' },
  { id: 'review', label: 'Review & Policies' },
  { id: 'payment', label: 'Payment' },
  { id: 'confirmation', label: 'Confirmation' },
]
