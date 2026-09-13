import { describe, it, expect } from 'vitest'
import {
  isGoogleCalendarConfigured,
  buildCalendarEventPayload,
  decideCalendarSyncAction,
  computeGoogleEventTimes,
} from './payload.js'

describe('isGoogleCalendarConfigured', () => {
  it('requires all four values', () => {
    expect(
      isGoogleCalendarConfigured({
        clientId: 'a',
        clientSecret: 'b',
        refreshToken: 'c',
        calendarId: 'd',
      })
    ).toBe(true)
  })

  it.each([
    { clientId: undefined, clientSecret: 'b', refreshToken: 'c', calendarId: 'd' },
    { clientId: 'a', clientSecret: undefined, refreshToken: 'c', calendarId: 'd' },
    { clientId: 'a', clientSecret: 'b', refreshToken: undefined, calendarId: 'd' },
    { clientId: 'a', clientSecret: 'b', refreshToken: 'c', calendarId: undefined },
  ])('is false when any one value is missing (%#)', (env) => {
    expect(isGoogleCalendarConfigured(env)).toBe(false)
  })

  it('is false for an empty/undefined env', () => {
    expect(isGoogleCalendarConfigured({})).toBe(false)
    expect(isGoogleCalendarConfigured(undefined)).toBe(false)
  })
})

describe('buildCalendarEventPayload', () => {
  const base = {
    serviceName: 'Soft Glam',
    customerName: 'Jane Doe',
    startIso: '2030-08-13T17:30:00.000Z',
    endIso: '2030-08-13T18:30:00.000Z',
    timezone: 'America/New_York',
    locationLine: '60 Susa Dr, Suite 121, Stafford, VA 22554',
    reference: 'abc-123',
  }

  it('builds a valid Calendar API event resource', () => {
    const payload = buildCalendarEventPayload(base)
    expect(payload.summary).toBe('Soft Glam — Jane Doe')
    expect(payload.start).toEqual({ dateTime: base.startIso, timeZone: base.timezone })
    expect(payload.end).toEqual({ dateTime: base.endIso, timeZone: base.timezone })
    expect(payload.location).toBe(base.locationLine)
    expect(payload.description).toContain('abc-123')
  })

  it('omits customer name from summary when not provided', () => {
    const payload = buildCalendarEventPayload({ ...base, customerName: undefined })
    expect(payload.summary).toBe('Soft Glam')
  })

  it('throws when required fields are missing', () => {
    expect(() => buildCalendarEventPayload({ ...base, startIso: undefined })).toThrow()
    expect(() => buildCalendarEventPayload({ ...base, timezone: undefined })).toThrow()
  })
})

describe('computeGoogleEventTimes', () => {
  it('computes naive local start/end strings from date, time, and duration', () => {
    const result = computeGoogleEventTimes('2030-08-13', '13:30', 60)
    expect(result).toEqual({ startIso: '2030-08-13T13:30:00', endIso: '2030-08-13T14:30:00' })
  })

  it('handles a start_time with seconds ("HH:MM:SS")', () => {
    const result = computeGoogleEventTimes('2030-08-13', '13:30:00', 60)
    expect(result.startIso).toBe('2030-08-13T13:30:00')
  })

  it('rolls over to the next day when duration crosses midnight', () => {
    const result = computeGoogleEventTimes('2030-08-13', '23:00', 120)
    expect(result).toEqual({ startIso: '2030-08-13T23:00:00', endIso: '2030-08-14T01:00:00' })
  })
})

describe('decideCalendarSyncAction', () => {
  it('creates when no row exists', () => {
    expect(decideCalendarSyncAction(null)).toBe('create')
  })

  it('skips once already created — the duplicate-event-prevention guarantee', () => {
    expect(decideCalendarSyncAction({ status: 'created' })).toBe('skip')
  })

  it('retries a failed or stuck-pending row', () => {
    expect(decideCalendarSyncAction({ status: 'failed' })).toBe('create')
    expect(decideCalendarSyncAction({ status: 'pending' })).toBe('create')
  })
})
