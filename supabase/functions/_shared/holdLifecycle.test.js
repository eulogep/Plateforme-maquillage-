import { describe, it, expect } from 'vitest'
import { computeHoldExpiresAt, isHoldExpired, resolveHoldDurationMinutes, DEFAULT_HOLD_DURATION_MINUTES } from './holdLifecycle.js'

describe('computeHoldExpiresAt', () => {
  it('adds the hold duration in minutes to the given time', () => {
    const now = new Date('2030-01-01T10:00:00Z')
    const result = computeHoldExpiresAt(now, 15)
    expect(result.toISOString()).toBe('2030-01-01T10:15:00.000Z')
  })

  it('defaults to DEFAULT_HOLD_DURATION_MINUTES when not specified', () => {
    const now = new Date('2030-01-01T10:00:00Z')
    const result = computeHoldExpiresAt(now)
    expect(result.getTime() - now.getTime()).toBe(DEFAULT_HOLD_DURATION_MINUTES * 60_000)
  })
})

describe('isHoldExpired', () => {
  it('returns false for a hold expiring in the future', () => {
    const now = new Date('2030-01-01T10:00:00Z')
    expect(isHoldExpired('2030-01-01T10:05:00Z', now)).toBe(false)
  })

  it('returns true for a hold that already expired', () => {
    const now = new Date('2030-01-01T10:10:00Z')
    expect(isHoldExpired('2030-01-01T10:05:00Z', now)).toBe(true)
  })

  it('treats exactly-now as expired (inclusive boundary)', () => {
    const now = new Date('2030-01-01T10:05:00Z')
    expect(isHoldExpired('2030-01-01T10:05:00Z', now)).toBe(true)
  })

  it('returns false when there is no hold_expires_at at all', () => {
    expect(isHoldExpired(null)).toBe(false)
  })
})

describe('resolveHoldDurationMinutes', () => {
  it('uses the provided value when it is a valid positive number', () => {
    expect(resolveHoldDurationMinutes('10')).toBe(10)
  })

  it('falls back to the default when unset', () => {
    expect(resolveHoldDurationMinutes(undefined)).toBe(DEFAULT_HOLD_DURATION_MINUTES)
  })

  it('falls back to the default when the value is not a positive number', () => {
    expect(resolveHoldDurationMinutes('not-a-number')).toBe(DEFAULT_HOLD_DURATION_MINUTES)
    expect(resolveHoldDurationMinutes('-5')).toBe(DEFAULT_HOLD_DURATION_MINUTES)
    expect(resolveHoldDurationMinutes('0')).toBe(DEFAULT_HOLD_DURATION_MINUTES)
  })
})
