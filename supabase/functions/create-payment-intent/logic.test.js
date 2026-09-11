import { describe, it, expect } from 'vitest'
import {
  AppError,
  validateInput,
  assertAppointmentPayable,
  shouldReuseExistingIntent,
  buildIdempotencyKey,
} from './logic.js'

describe('validateInput', () => {
  it('accepts a valid UUID appointmentId', () => {
    expect(validateInput({ appointmentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })).toEqual({
      appointmentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
  })

  it('rejects a missing appointmentId', () => {
    expect(() => validateInput({})).toThrow(AppError)
  })

  it('rejects a non-UUID appointmentId', () => {
    expect(() => validateInput({ appointmentId: 'not-a-uuid' })).toThrow(AppError)
  })

  it('rejects a non-object body', () => {
    expect(() => validateInput(null)).toThrow(AppError)
  })
})

describe('assertAppointmentPayable', () => {
  it('allows a pending appointment', () => {
    expect(() => assertAppointmentPayable({ status: 'pending' })).not.toThrow()
  })

  it('allows a payment_pending appointment (retry)', () => {
    expect(() => assertAppointmentPayable({ status: 'payment_pending' })).not.toThrow()
  })

  it('rejects a missing appointment with APPOINTMENT_NOT_FOUND', () => {
    try {
      assertAppointmentPayable(null)
      throw new Error('expected to throw')
    } catch (err) {
      expect(err.code).toBe('APPOINTMENT_NOT_FOUND')
    }
  })

  it.each(['confirmed', 'cancelled', 'expired', 'completed', 'no_show'])(
    'rejects a %s appointment with INVALID_APPOINTMENT_STATE',
    (status) => {
      try {
        assertAppointmentPayable({ status })
        throw new Error('expected to throw')
      } catch (err) {
        expect(err.code).toBe('INVALID_APPOINTMENT_STATE')
      }
    }
  )
})

describe('shouldReuseExistingIntent', () => {
  it.each(['requires_payment_method', 'requires_confirmation', 'requires_action', 'processing'])(
    'reuses an intent in %s state',
    (status) => {
      expect(shouldReuseExistingIntent(status)).toBe(true)
    }
  )

  it.each(['succeeded', 'canceled'])('does not reuse an intent in %s state', (status) => {
    expect(shouldReuseExistingIntent(status)).toBe(false)
  })
})

describe('buildIdempotencyKey', () => {
  it('is stable for the same appointment id', () => {
    const a = buildIdempotencyKey('abc-123')
    const b = buildIdempotencyKey('abc-123')
    expect(a).toBe(b)
  })

  it('differs across appointment ids', () => {
    expect(buildIdempotencyKey('abc-123')).not.toBe(buildIdempotencyKey('xyz-789'))
  })
})
