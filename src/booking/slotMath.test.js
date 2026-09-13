import { describe, it, expect } from 'vitest'
import { timeToMinutes, minutesToTime, computeAvailableSlots } from './slotMath'

describe('timeToMinutes / minutesToTime', () => {
  it('round-trips HH:MM', () => {
    expect(timeToMinutes('09:00')).toBe(540)
    expect(timeToMinutes('13:30')).toBe(810)
    expect(minutesToTime(540)).toBe('09:00')
    expect(minutesToTime(810)).toBe('13:30')
  })
})

describe('computeAvailableSlots', () => {
  const baseParams = {
    openTime: '09:00',
    closeTime: '12:00',
    durationMinutes: 60,
    slotIntervalMinutes: 30,
  }

  it('generates slots across the open window, none past the last slot that still fits', () => {
    const slots = computeAvailableSlots(baseParams)
    // 9:00–12:00, 60min service, 30min interval -> last slot starts at 11:00 (ends 12:00)
    expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30', '11:00'])
  })

  it('returns an empty array when there is no open/close time (closed day)', () => {
    expect(computeAvailableSlots({ ...baseParams, openTime: null, closeTime: null })).toEqual([])
  })

  it('excludes slots that overlap an existing appointment, honoring the buffer', () => {
    // Existing appointment 10:00-11:00, buffer 15 -> busy through 11:15.
    // Every 60min slot starting at 09:30 or later ends after 10:00, so it
    // overlaps the buffered busy window (600-675); only 09:00 (ends exactly
    // at 10:00) is clear.
    const slots = computeAvailableSlots({
      ...baseParams,
      bufferMinutes: 15,
      busyRanges: [{ start: 600, end: 660 }], // 10:00-11:00
    })
    expect(slots).toEqual(['09:00'])
  })

  it('excludes past times when the day is today', () => {
    const slots = computeAvailableSlots({
      ...baseParams,
      isToday: true,
      nowMinutes: timeToMinutes('10:15'),
    })
    expect(slots).toEqual(['10:30', '11:00'])
  })

  it('still returns the one slot that exactly fills the window', () => {
    // 09:00-12:00 is exactly 180 minutes — a 180min service fits exactly once.
    expect(computeAvailableSlots({ ...baseParams, durationMinutes: 180 })).toEqual(['09:00'])
  })

  it('never returns a slot longer than the open window', () => {
    const slots = computeAvailableSlots({ ...baseParams, durationMinutes: 200 }) // longer than the whole window
    expect(slots).toEqual([])
  })
})
