import { describe, it, expect } from 'vitest'
import { generateIcs } from './generateIcs'

const base = {
  serviceName: 'Soft Glam',
  businessName: 'Emmanuelle Singani',
  dateStr: '2030-08-13',
  startTime: '13:30',
  durationMinutes: 60,
  timezone: 'America/New_York',
  locationLine: '60 Susa Dr, Suite 121, Stafford, VA 22554',
  reference: 'abc-123',
}

describe('generateIcs', () => {
  it('produces a well-formed VCALENDAR/VEVENT block', () => {
    const ics = generateIcs(base)
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('END:VEVENT')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).toContain('UID:abc-123@emmanuellesingani-booking')
  })

  it('anchors the start time to the business timezone, not UTC-as-if-local', () => {
    // Aug 13 2030 is during US Eastern Daylight Time (UTC-4), so
    // 1:30 PM America/New_York must become 17:30 UTC — not 13:30 UTC
    // (which is what you'd get by naively treating the wall-clock time as
    // already UTC).
    const ics = generateIcs(base)
    expect(ics).toContain('DTSTART:20300813T173000Z')
  })

  it('computes DTEND from the exact duration', () => {
    const ics = generateIcs({ ...base, durationMinutes: 90 })
    // 17:30 UTC + 90min = 19:00 UTC
    expect(ics).toContain('DTSTART:20300813T173000Z')
    expect(ics).toContain('DTEND:20300813T190000Z')
  })

  it('handles a duration that crosses into the next UTC day', () => {
    const ics = generateIcs({ ...base, startTime: '23:00', durationMinutes: 120 })
    // 23:00 EDT = 03:00 UTC next day; +120min = 05:00 UTC next day
    expect(ics).toContain('DTSTART:20300814T030000Z')
    expect(ics).toContain('DTEND:20300814T050000Z')
  })

  it('respects standard time (winter) vs. daylight time (summer) offsets correctly', () => {
    // Jan 13 2030 is EST (UTC-5): 1:30 PM -> 18:30 UTC
    const winterIcs = generateIcs({ ...base, dateStr: '2030-01-13' })
    expect(winterIcs).toContain('DTSTART:20300113T183000Z')
  })

  it('includes service name, business name, and location', () => {
    const ics = generateIcs(base)
    expect(ics).toContain('SUMMARY:Soft Glam — Emmanuelle Singani')
    expect(ics).toContain('LOCATION:60 Susa Dr\\, Suite 121\\, Stafford\\, VA 22554')
  })

  it('escapes commas in text fields per the ICS spec', () => {
    const ics = generateIcs(base)
    // LOCATION line's commas must be backslash-escaped
    const locationLine = ics.split('\r\n').find((l) => l.startsWith('LOCATION:'))
    expect(locationLine).toBe('LOCATION:60 Susa Dr\\, Suite 121\\, Stafford\\, VA 22554')
  })

  it('throws when required timing fields are missing or invalid', () => {
    expect(() => generateIcs({ ...base, dateStr: undefined })).toThrow()
    expect(() => generateIcs({ ...base, durationMinutes: 0 })).toThrow()
    expect(() => generateIcs({ ...base, durationMinutes: -10 })).toThrow()
  })
})
