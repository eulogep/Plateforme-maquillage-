import { describe, it, expect } from 'vitest'
import { formatDateLabel, formatTimeLabel, formatPhoneLabel } from './formatting.js'

describe('formatDateLabel', () => {
  it('formats a date string as "Mon D, YYYY"', () => {
    expect(formatDateLabel('2030-08-13')).toBe('Aug 13, 2030')
  })

  it('does not shift the date across a UTC/local boundary', () => {
    expect(formatDateLabel('2030-01-01')).toBe('Jan 1, 2030')
    expect(formatDateLabel('2030-12-31')).toBe('Dec 31, 2030')
  })
})

describe('formatTimeLabel', () => {
  it('formats morning times', () => {
    expect(formatTimeLabel('09:00')).toBe('9:00 AM')
  })

  it('formats afternoon times', () => {
    expect(formatTimeLabel('13:30')).toBe('1:30 PM')
  })

  it('formats noon and midnight correctly', () => {
    expect(formatTimeLabel('12:00')).toBe('12:00 PM')
    expect(formatTimeLabel('00:00')).toBe('12:00 AM')
  })
})

describe('formatPhoneLabel', () => {
  it('formats an E.164 US number for display', () => {
    expect(formatPhoneLabel('+15712669829')).toBe('(571) 266-9829')
  })

  it('passes through null/undefined unchanged', () => {
    expect(formatPhoneLabel(null)).toBe(null)
    expect(formatPhoneLabel(undefined)).toBe(undefined)
  })

  it('returns non-10-digit input unchanged rather than mangling it', () => {
    expect(formatPhoneLabel('12345')).toBe('12345')
  })
})
