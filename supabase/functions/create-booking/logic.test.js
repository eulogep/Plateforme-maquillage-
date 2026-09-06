import { describe, it, expect } from 'vitest'
import {
  AppError,
  validateBookingPayload,
  validatePhotoMetadata,
  computeBookingWindow,
  hashPayload,
  mapDatabaseError,
  normalizeEmail,
} from './logic.js'

// NOTE on test coverage: this file covers everything that's pure/testable
// under Node (Vitest). The database-level guarantee itself — the
// `appointments_no_overlap` exclusion constraint actually rejecting a
// concurrent overlapping INSERT — can only be exercised against a real
// Postgres instance, which isn't available in this environment (no Deno
// runtime, no live Supabase project connected). What IS tested here is
// every piece of logic that decides what happens around that guarantee:
// input validation, the availability re-check, and how a resulting
// Postgres error code gets mapped onto the app's error contract.

const validPayload = {
  serviceId: 'soft-glam',
  fullName: 'Jane Doe',
  email: 'Jane@Example.com',
  phone: '555-123-4567',
  occasion: 'Wedding',
  notes: 'Allergic to fragrance',
  date: '2030-08-13',
  startTime: '13:30',
  policiesAccepted: true,
  idempotencyKey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
}

describe('validateBookingPayload', () => {
  it('accepts a fully valid payload and lowercases the email', () => {
    const result = validateBookingPayload(validPayload)
    expect(result.email).toBe('jane@example.com')
    expect(result.serviceId).toBe('soft-glam')
    expect(result.date).toBe('2030-08-13')
  })

  it('rejects a missing fullName', () => {
    expect(() => validateBookingPayload({ ...validPayload, fullName: '' })).toThrow(AppError)
  })

  it('rejects an invalid email', () => {
    expect(() => validateBookingPayload({ ...validPayload, email: 'not-an-email' })).toThrow(AppError)
  })

  it('rejects a malformed date', () => {
    expect(() => validateBookingPayload({ ...validPayload, date: '08/13/2030' })).toThrow(AppError)
  })

  it('rejects a malformed time', () => {
    expect(() => validateBookingPayload({ ...validPayload, startTime: '1:30pm' })).toThrow(AppError)
  })

  it('rejects a non-UUID idempotency key', () => {
    expect(() => validateBookingPayload({ ...validPayload, idempotencyKey: 'not-a-uuid' })).toThrow(AppError)
  })

  it('rejects when policies were not accepted', () => {
    expect(() => validateBookingPayload({ ...validPayload, policiesAccepted: false })).toThrow(AppError)
  })

  it('never reads price, duration, endTime, deposit, or status from the payload', () => {
    const result = validateBookingPayload({
      ...validPayload,
      price: 1,
      durationMinutes: 999,
      endTime: '23:59',
      depositAmount: 0,
      status: 'confirmed',
    })
    expect(result).not.toHaveProperty('price')
    expect(result).not.toHaveProperty('durationMinutes')
    expect(result).not.toHaveProperty('endTime')
    expect(result).not.toHaveProperty('depositAmount')
    expect(result).not.toHaveProperty('status')
  })

  it('throws with error code INVALID_INPUT for bad input', () => {
    try {
      validateBookingPayload({ ...validPayload, email: 'nope' })
      throw new Error('expected to throw')
    } catch (err) {
      expect(err.code).toBe('INVALID_INPUT')
    }
  })
})

describe('validatePhotoMetadata', () => {
  it('returns null when no file is given', () => {
    expect(validatePhotoMetadata(null)).toBeNull()
  })

  it('accepts a valid jpeg under the size limit', () => {
    const result = validatePhotoMetadata({ type: 'image/jpeg', size: 1024, name: 'look.jpg' })
    expect(result.type).toBe('image/jpeg')
  })

  it('rejects an unsupported file type', () => {
    expect(() => validatePhotoMetadata({ type: 'application/pdf', size: 1024, name: 'file.pdf' })).toThrow(AppError)
  })

  it('rejects a file over 8MB', () => {
    expect(() =>
      validatePhotoMetadata({ type: 'image/png', size: 9 * 1024 * 1024, name: 'huge.png' })
    ).toThrow(AppError)
  })
})

describe('computeBookingWindow', () => {
  const rule = { is_closed: false, open_time: '09:00:00', close_time: '18:00:00', buffer_minutes: 15 }
  const service = { active: true, duration_minutes: 60 }

  it('computes the correct end time and passes through the buffer', () => {
    const result = computeBookingWindow({ service, rule, isBlocked: false, startTime: '10:00' })
    expect(result).toEqual({ endTime: '11:00', durationMinutes: 60, bufferMinutes: 15 })
  })

  it('accepts a slot starting exactly at open time', () => {
    expect(() => computeBookingWindow({ service, rule, isBlocked: false, startTime: '09:00' })).not.toThrow()
  })

  it('accepts a slot ending exactly at close time', () => {
    // 17:00 + 60min = 18:00, exactly at close — should be allowed.
    expect(() => computeBookingWindow({ service, rule, isBlocked: false, startTime: '17:00' })).not.toThrow()
  })

  it('rejects a slot that would end after close time', () => {
    expect(() => computeBookingWindow({ service, rule, isBlocked: false, startTime: '17:30' })).toThrow(AppError)
  })

  it('rejects a slot starting before open time', () => {
    expect(() => computeBookingWindow({ service, rule, isBlocked: false, startTime: '08:00' })).toThrow(AppError)
  })

  it('rejects an inactive service with INVALID_SERVICE', () => {
    try {
      computeBookingWindow({ service: { active: false, duration_minutes: 60 }, rule, isBlocked: false, startTime: '10:00' })
      throw new Error('expected to throw')
    } catch (err) {
      expect(err.code).toBe('INVALID_SERVICE')
    }
  })

  it('rejects a missing service with INVALID_SERVICE', () => {
    try {
      computeBookingWindow({ service: null, rule, isBlocked: false, startTime: '10:00' })
      throw new Error('expected to throw')
    } catch (err) {
      expect(err.code).toBe('INVALID_SERVICE')
    }
  })

  it('rejects a blocked date with BLOCKED_DATE, even with normal hours', () => {
    try {
      computeBookingWindow({ service, rule, isBlocked: true, startTime: '10:00' })
      throw new Error('expected to throw')
    } catch (err) {
      expect(err.code).toBe('BLOCKED_DATE')
    }
  })

  it('rejects a closed day with OUTSIDE_BUSINESS_HOURS', () => {
    try {
      computeBookingWindow({ service, rule: { is_closed: true }, isBlocked: false, startTime: '10:00' })
      throw new Error('expected to throw')
    } catch (err) {
      expect(err.code).toBe('OUTSIDE_BUSINESS_HOURS')
    }
  })

  it('rejects when there is no rule at all for that weekday', () => {
    try {
      computeBookingWindow({ service, rule: null, isBlocked: false, startTime: '10:00' })
      throw new Error('expected to throw')
    } catch (err) {
      expect(err.code).toBe('OUTSIDE_BUSINESS_HOURS')
    }
  })
})

describe('hashPayload', () => {
  it('produces the same hash for the same logical payload regardless of key order', () => {
    const a = hashPayload({ x: 1, y: 2 })
    const b = hashPayload({ y: 2, x: 1 })
    expect(a).toBe(b)
  })

  it('produces a different hash when the payload differs', () => {
    const a = hashPayload({ ...validPayload })
    const b = hashPayload({ ...validPayload, startTime: '14:00' })
    expect(a).not.toBe(b)
  })
})

describe('mapDatabaseError', () => {
  it('maps a 23P01 exclusion violation to SLOT_UNAVAILABLE', () => {
    const mapped = mapDatabaseError({ code: '23P01' })
    expect(mapped).toBeInstanceOf(AppError)
    expect(mapped.code).toBe('SLOT_UNAVAILABLE')
  })

  it('signals the idempotency race (23505) with null, for the caller to re-query', () => {
    expect(mapDatabaseError({ code: '23505' })).toBeNull()
  })

  it('maps any other Postgres error to INTERNAL_ERROR', () => {
    const mapped = mapDatabaseError({ code: '42601' })
    expect(mapped.code).toBe('INTERNAL_ERROR')
  })
})

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Jane@Example.COM  ')).toBe('jane@example.com')
  })
})
