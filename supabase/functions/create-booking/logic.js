// Pure, runtime-agnostic booking logic for the create-booking Edge
// Function. Deliberately has ZERO imports: index.ts runs on Deno (Supabase
// Edge Functions) while this file is also imported directly by Vitest
// (Node) for testing, so it can't depend on either runtime's globals or on
// bare-specifier npm packages (which resolve differently in Deno vs Node).
// Time/slot arithmetic is intentionally re-implemented here rather than
// imported from src/booking/slotMath.js — that file is reachable from Vite
// via the "@/" alias, which does not exist under Deno, so sharing it
// directly across the Vite app and this Edge Function isn't practical.

export class AppError extends Error {
  constructor(code, message, details) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const MAX_PHOTO_BYTES = 8 * 1024 * 1024

function requireString(value, field, { max = 500, min = 1 } = {}) {
  if (typeof value !== 'string') {
    throw new AppError('INVALID_INPUT', `${field} is required`, { field })
  }
  const trimmed = value.trim()
  if (trimmed.length < min) {
    throw new AppError('INVALID_INPUT', `${field} is required`, { field })
  }
  if (trimmed.length > max) {
    throw new AppError('INVALID_INPUT', `${field} is too long`, { field })
  }
  return trimmed
}

function optionalString(value, field, { max = 500 } = {}) {
  if (value === undefined || value === null || value === '') return ''
  return requireString(value, field, { max, min: 0 })
}

/**
 * Validates and normalizes the client-submitted booking payload. Only ever
 * extracts the fields listed here — price, duration, end time, deposit
 * amount, and status are never read from client input at all, anywhere in
 * this module.
 */
export function validateBookingPayload(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new AppError('INVALID_INPUT', 'Request body must be a JSON object')
  }

  const serviceId = requireString(raw.serviceId, 'serviceId', { max: 100 })
  const fullName = requireString(raw.fullName, 'fullName', { max: 200 })
  const emailRaw = requireString(raw.email, 'email', { max: 320 })
  const phone = requireString(raw.phone, 'phone', { max: 30, min: 7 })
  const occasion = optionalString(raw.occasion, 'occasion', { max: 120 })
  const notes = optionalString(raw.notes, 'notes', { max: 500 })
  const date = requireString(raw.date, 'date', { max: 10 })
  const startTime = requireString(raw.startTime, 'startTime', { max: 5 })
  const idempotencyKey = requireString(raw.idempotencyKey, 'idempotencyKey', { max: 64 })

  if (!EMAIL_RE.test(emailRaw)) {
    throw new AppError('INVALID_INPUT', 'Enter a valid email address', { field: 'email' })
  }
  if (!DATE_RE.test(date)) {
    throw new AppError('INVALID_INPUT', 'Invalid date format (expected YYYY-MM-DD)', { field: 'date' })
  }
  if (!TIME_RE.test(startTime)) {
    throw new AppError('INVALID_INPUT', 'Invalid time format (expected HH:MM)', { field: 'startTime' })
  }
  if (!UUID_RE.test(idempotencyKey)) {
    throw new AppError('INVALID_INPUT', 'idempotencyKey must be a UUID', { field: 'idempotencyKey' })
  }
  if (raw.policiesAccepted !== true) {
    throw new AppError('INVALID_INPUT', 'Booking policies must be accepted', { field: 'policiesAccepted' })
  }

  return {
    serviceId,
    fullName,
    email: emailRaw.toLowerCase(),
    phone,
    occasion,
    notes,
    date,
    startTime,
    idempotencyKey,
  }
}

/** Validates inspiration-photo metadata server-side. `file` is optional. */
export function validatePhotoMetadata(file) {
  if (!file) return null
  const { type, size, name } = file
  if (!ALLOWED_PHOTO_TYPES.includes(type)) {
    throw new AppError('INVALID_INPUT', 'Inspiration photo must be a JPEG, PNG, WEBP, or HEIC image', {
      field: 'inspirationPhoto',
    })
  }
  if (typeof size === 'number' && size > MAX_PHOTO_BYTES) {
    throw new AppError('INVALID_INPUT', 'Inspiration photo must be 8MB or smaller', {
      field: 'inspirationPhoto',
    })
  }
  return { type, size, name: name ?? 'inspiration-photo' }
}

export function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Re-validates the requested slot against authoritative server-side data
 * (never the client's earlier view of availability) and computes the
 * booking window. Throws a structured AppError for every rejection case;
 * the actual no-double-booking guarantee is enforced separately, at the
 * database level, by the exclusion constraint — this function only rules
 * out the cases that don't need a live conflict check (closed day, blocked
 * date, outside hours).
 *
 * @param {object} params
 * @param {{active: boolean, duration_minutes: number} | null} params.service
 * @param {{is_closed: boolean, open_time: string, close_time: string, buffer_minutes: number} | null} params.rule
 * @param {boolean} params.isBlocked
 * @param {string} params.startTime - "HH:MM"
 */
export function computeBookingWindow({ service, rule, isBlocked, startTime }) {
  if (!service || service.active === false) {
    throw new AppError('INVALID_SERVICE', 'This service is not available for booking')
  }
  if (isBlocked) {
    throw new AppError('BLOCKED_DATE', 'This date is not available')
  }
  if (!rule || rule.is_closed) {
    throw new AppError('OUTSIDE_BUSINESS_HOURS', 'Closed on the selected date')
  }

  const openMin = timeToMinutes(rule.open_time.slice(0, 5))
  const closeMin = timeToMinutes(rule.close_time.slice(0, 5))
  const startMin = timeToMinutes(startTime)
  const endMin = startMin + service.duration_minutes

  if (startMin < openMin || endMin > closeMin) {
    throw new AppError('OUTSIDE_BUSINESS_HOURS', 'Selected time is outside business hours')
  }

  return {
    endTime: minutesToTime(endMin),
    durationMinutes: service.duration_minutes,
    bufferMinutes: rule.buffer_minutes,
  }
}

/**
 * Small, dependency-free, non-cryptographic hash (FNV-1a) used only to tell
 * "the same idempotent request, retried" apart from "this idempotency key
 * was reused for a different booking" — not a security primitive.
 */
export function hashPayload(payload) {
  const stable = JSON.stringify(payload, Object.keys(payload).sort())
  let hash = 0x811c9dc5
  for (let i = 0; i < stable.length; i++) {
    hash ^= stable.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16)
}

export function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

// Local dev origins that are always allowed, regardless of ALLOWED_ORIGINS.
// 5173/4173 are Vite's default dev/preview ports.
export const DEFAULT_DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173']

/**
 * Decides what to send back as Access-Control-Allow-Origin — reflects the
 * request's Origin header only if it's on the allow-list, and returns null
 * otherwise (meaning: omit the header entirely, which browsers treat as a
 * CORS rejection). Never returns a bare '*'.
 *
 * @param {string | null} requestOrigin - the incoming request's Origin header
 * @param {string} [extraOriginsEnv] - comma-separated list, e.g. from the
 *   ALLOWED_ORIGINS environment variable, for the production domain(s) —
 *   configurable without a code change.
 */
export function resolveAllowedOrigin(requestOrigin, extraOriginsEnv = '') {
  if (!requestOrigin) return null
  const configured = extraOriginsEnv
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
  const allowed = new Set([...DEFAULT_DEV_ORIGINS, ...configured])
  return allowed.has(requestOrigin) ? requestOrigin : null
}

/**
 * Maps a Postgres error onto the app's error contract. Returning `null`
 * signals "this was the idempotency-key race" (23505 on the unique index)
 * — the caller should re-query for the row that won and return it as a
 * success, not an error. Any other Postgres error becomes INTERNAL_ERROR.
 *
 * NOTE: the exclusion constraint (23P01) itself can only be exercised
 * against a real Postgres instance — this function only covers the
 * (fully testable) mapping from a Postgres error code to our error
 * contract, not the database guarantee itself.
 */
export function mapDatabaseError(error) {
  if (error?.code === '23P01') {
    return new AppError('SLOT_UNAVAILABLE', 'This time was just booked by someone else — please choose another time.')
  }
  if (error?.code === '23505') {
    return null
  }
  return new AppError('INTERNAL_ERROR', 'Something went wrong. Please try again.')
}
