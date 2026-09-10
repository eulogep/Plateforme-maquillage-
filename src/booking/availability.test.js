import { describe, it, expect, vi } from 'vitest'
import { isDateAvailableFromContext, loadAvailabilityContext, getAvailableTimeSlots } from './availability'

// These unit tests explicitly exercise the unconfigured fallback. A local
// developer's .env.local must never turn them into live Supabase requests.
vi.mock('@/lib/supabaseClient', () => ({
  supabase: null,
  isSupabaseConfigured: false,
}))

// A fixed weekly schedule for testing the pure predicate — Sunday closed,
// every other day open. Weekday numbers follow JS Date#getDay() (0=Sun).
const context = {
  rulesByWeekday: {
    0: { isClosed: true },
    1: { isClosed: false, open: '09:00', close: '18:00', bufferMinutes: 15 },
    2: { isClosed: false, open: '09:00', close: '18:00', bufferMinutes: 15 },
    3: { isClosed: false, open: '09:00', close: '18:00', bufferMinutes: 15 },
    4: { isClosed: false, open: '09:00', close: '18:00', bufferMinutes: 15 },
    5: { isClosed: false, open: '09:00', close: '18:00', bufferMinutes: 15 },
    6: { isClosed: false, open: '10:00', close: '16:00', bufferMinutes: 15 },
  },
  blockedDates: new Set(['2030-12-25']),
}

describe('isDateAvailableFromContext', () => {
  it('rejects dates in the past', () => {
    expect(isDateAvailableFromContext(new Date('2000-01-03T12:00:00'), context)).toBe(false)
  })

  it('rejects a closed weekday (Sunday, 2030-12-01)', () => {
    expect(isDateAvailableFromContext(new Date('2030-12-01T12:00:00'), context)).toBe(false)
  })

  it('accepts an open weekday in the future (Monday, 2030-12-02)', () => {
    expect(isDateAvailableFromContext(new Date('2030-12-02T12:00:00'), context)).toBe(true)
  })

  it('rejects an explicitly blocked date even on an otherwise-open weekday', () => {
    // 2030-12-25 is a Wednesday (normally open) but explicitly blocked.
    expect(isDateAvailableFromContext(new Date('2030-12-25T12:00:00'), context)).toBe(false)
  })

  it('returns false with no context loaded yet', () => {
    expect(isDateAvailableFromContext(new Date('2030-12-02T12:00:00'), null)).toBe(false)
  })
})

describe('mock fallback (no Supabase configured in test env)', () => {
  it('loadAvailabilityContext resolves with a usable shape', async () => {
    const result = await loadAvailabilityContext()
    expect(result).toHaveProperty('rulesByWeekday')
    expect(result).toHaveProperty('blockedDates')
  })

  it('getAvailableTimeSlots resolves to an array without throwing', async () => {
    const slots = await getAvailableTimeSlots(new Date('2030-12-02T12:00:00'), 60)
    expect(Array.isArray(slots)).toBe(true)
  })
})
