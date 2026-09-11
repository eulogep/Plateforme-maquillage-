import { describe, it, expect } from 'vitest'
import { buildBrandedEmailContent, BrandedEmailError, BRANDED_EMAIL_TYPES } from './templates.js'

const baseCtx = {
  businessName: 'Emmanuelle Singani',
  locationLine: '60 Susa Dr, Suite 121, Stafford, VA 22554',
  contactEmail: 'emmanuellesingani23@gmail.com',
  contactPhone: null,
  customerName: 'Jane Doe',
  serviceName: 'Soft Glam',
  dateLabel: 'Aug 13, 2030',
  timeLabel: '1:30 PM',
  durationLabel: '60 min',
  appointmentReference: 'abc-123',
  amountDueNowLabel: '$37.50',
  remainingBalanceLabel: '$87.50',
  amountPaidLabel: '$37.50',
}

describe('buildBrandedEmailContent', () => {
  it('throws for an unknown type', () => {
    expect(() => buildBrandedEmailContent('not_real', baseCtx)).toThrow(BrandedEmailError)
  })

  it('throws when required fields are missing', () => {
    expect(() => buildBrandedEmailContent('booking_confirmed', { customerName: 'Jane' })).toThrow(BrandedEmailError)
  })

  it.each(BRANDED_EMAIL_TYPES)('renders a complete HTML document for %s', (type) => {
    const { subject, html } = buildBrandedEmailContent(type, baseCtx)
    expect(subject.length).toBeGreaterThan(0)
    expect(html).toMatch(/^<!doctype html>/i)
    expect(html).toContain('Jane') // greets by first name
    expect(html).toContain('abc-123')
  })

  it('booking_payment_pending greets by first name and shows amounts, never claims confirmation', () => {
    const { html, subject } = buildBrandedEmailContent('booking_payment_pending', baseCtx)
    expect(html).toContain('Hi Jane')
    expect(html).toContain('$37.50')
    expect(subject.toLowerCase()).toContain('pending')
    expect(html.toLowerCase()).not.toContain('confirmed!')
  })

  it('booking_confirmed says confirmed and shows amount paid', () => {
    const { html, subject } = buildBrandedEmailContent('booking_confirmed', baseCtx)
    expect(subject.toLowerCase()).toContain('booked')
    expect(html.toLowerCase()).toContain('confirmed')
    expect(html).toContain('$37.50')
  })

  it('payment_failed uses reassuring language and never claims confirmation', () => {
    const { html } = buildBrandedEmailContent('payment_failed', baseCtx)
    expect(html.toLowerCase()).toContain("weren't able to process")
    expect(html.toLowerCase()).not.toContain('confirmed')
  })

  it('appointment_reminder omits the preparation section when no note is given', () => {
    const { html } = buildBrandedEmailContent('appointment_reminder', baseCtx)
    expect(html).not.toContain('undefined')
  })

  it('appointment_reminder includes the preparation section when a note is given', () => {
    const { html } = buildBrandedEmailContent('appointment_reminder', { ...baseCtx, preparationNote: 'Arrive fresh-faced.' })
    expect(html).toContain('Arrive fresh-faced.')
  })

  it('omits CTA buttons entirely when no URL is supplied, rather than a broken link', () => {
    const { html } = buildBrandedEmailContent('booking_confirmed', { ...baseCtx, addToCalendarUrl: undefined, bookingDetailsUrl: undefined })
    expect(html).not.toContain('href=""')
  })

  it('includes a real CTA link when a URL is supplied', () => {
    const { html } = buildBrandedEmailContent('booking_confirmed', { ...baseCtx, addToCalendarUrl: 'https://example.com/ics/abc-123' })
    expect(html).toContain('https://example.com/ics/abc-123')
    expect(html).toContain('Add to Calendar')
  })

  it('never fabricates cancellation/deposit policy wording in any template', () => {
    for (const type of BRANDED_EMAIL_TYPES) {
      const { html } = buildBrandedEmailContent(type, baseCtx)
      expect(html.toLowerCase()).not.toContain('cancellation policy')
      expect(html.toLowerCase()).not.toContain('non-refundable')
    }
  })

  it('never renders a phone number when none is provided', () => {
    for (const type of BRANDED_EMAIL_TYPES) {
      const { html } = buildBrandedEmailContent(type, { ...baseCtx, contactPhone: null })
      expect(html).not.toContain('null')
    }
  })
})
