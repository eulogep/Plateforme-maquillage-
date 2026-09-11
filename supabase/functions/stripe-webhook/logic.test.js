import { describe, it, expect } from 'vitest'
import { extractAppointmentId, decideSucceededOutcome, decideFailureOutcome } from './logic.js'

const neverExpired = () => false
const alwaysExpired = () => true

describe('extractAppointmentId', () => {
  it('reads metadata.appointment_id', () => {
    expect(extractAppointmentId({ metadata: { appointment_id: 'abc-123' } })).toBe('abc-123')
  })

  it('returns null when metadata is missing', () => {
    expect(extractAppointmentId({})).toBeNull()
    expect(extractAppointmentId(null)).toBeNull()
  })
})

describe('decideSucceededOutcome', () => {
  it('confirms a live payment_pending appointment with the correct amount', () => {
    const appointment = { status: 'payment_pending', amount_due_now_cents: 5000, hold_expires_at: '2030-01-01T00:00:00Z' }
    const result = decideSucceededOutcome({ appointment, paidAmountCents: 5000, isHoldExpired: neverExpired })
    expect(result).toEqual({ action: 'confirm', reason: 'payment_verified' })
  })

  it('records a payment exception when the appointment is not found', () => {
    const result = decideSucceededOutcome({ appointment: null, paidAmountCents: 5000, isHoldExpired: neverExpired })
    expect(result.action).toBe('record_exception')
    expect(result.reason).toBe('appointment_not_found')
  })

  it('is a no-op for an already-confirmed appointment (duplicate/redelivered event)', () => {
    const appointment = { status: 'confirmed', amount_due_now_cents: 5000 }
    const result = decideSucceededOutcome({ appointment, paidAmountCents: 5000, isHoldExpired: neverExpired })
    expect(result).toEqual({ action: 'noop', reason: 'already_confirmed' })
  })

  it('records a payment exception — never confirms — when the hold had already expired', () => {
    const appointment = { status: 'payment_pending', amount_due_now_cents: 5000, hold_expires_at: '2020-01-01T00:00:00Z' }
    const result = decideSucceededOutcome({ appointment, paidAmountCents: 5000, isHoldExpired: alwaysExpired })
    expect(result.action).toBe('record_exception')
    expect(result.reason).toBe('hold_expired_before_confirmation')
  })

  it('records a payment exception on amount mismatch, even for a live hold', () => {
    const appointment = { status: 'payment_pending', amount_due_now_cents: 5000, hold_expires_at: '2030-01-01T00:00:00Z' }
    const result = decideSucceededOutcome({ appointment, paidAmountCents: 4999, isHoldExpired: neverExpired })
    expect(result.action).toBe('record_exception')
    expect(result.reason).toBe('amount_mismatch')
  })

  it.each(['pending', 'cancelled', 'expired', 'completed', 'no_show'])(
    'never confirms a %s appointment — records an exception instead',
    (status) => {
      const appointment = { status, amount_due_now_cents: 5000 }
      const result = decideSucceededOutcome({ appointment, paidAmountCents: 5000, isHoldExpired: neverExpired })
      expect(result.action).toBe('record_exception')
      expect(result.reason).toBe(`appointment_status_${status}`)
    }
  )
})

describe('decideFailureOutcome', () => {
  it('updates payment_status for a live payment_pending appointment', () => {
    const result = decideFailureOutcome({ appointment: { status: 'payment_pending' }, newPaymentStatus: 'failed' })
    expect(result).toEqual({ action: 'update_payment_status', reason: 'stripe_reported', newPaymentStatus: 'failed' })
  })

  it('is a no-op when the appointment is missing', () => {
    expect(decideFailureOutcome({ appointment: null, newPaymentStatus: 'failed' }).action).toBe('noop')
  })

  it.each(['confirmed', 'cancelled', 'expired'])('is a no-op for a %s appointment', (status) => {
    const result = decideFailureOutcome({ appointment: { status }, newPaymentStatus: 'canceled' })
    expect(result.action).toBe('noop')
  })
})
