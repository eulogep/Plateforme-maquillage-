import { describe, it, expect } from 'vitest'
import { buildEmailContent, NotificationContentError } from './content.js'

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
  amountDueNowCents: 3750,
  remainingBalanceCents: 8750,
  amountPaidCents: 3750,
}

describe('buildEmailContent', () => {
  it('throws for an unknown notification type', () => {
    expect(() => buildEmailContent('not_a_real_type', baseCtx)).toThrow(NotificationContentError)
  })

  it('throws when required fields are missing', () => {
    expect(() => buildEmailContent('booking_confirmed', { customerName: 'Jane' })).toThrow(NotificationContentError)
  })

  it('booking_payment_pending includes the amount due and remaining balance', () => {
    const { subject, text, html } = buildEmailContent('booking_payment_pending', baseCtx)
    expect(subject).toContain('payment pending')
    expect(text).toContain('$37.50')
    expect(text).toContain('$87.50')
    expect(html).toContain('$37.50')
    expect(text).toContain('abc-123')
  })

  it('booking_confirmed says the booking is confirmed and includes amount paid', () => {
    const { subject, text } = buildEmailContent('booking_confirmed', baseCtx)
    expect(subject.toLowerCase()).toContain('booked')
    expect(text).toContain('confirmed')
    expect(text).toContain('$37.50')
  })

  it('payment_failed tells the customer to retry, does not claim confirmation', () => {
    const { text } = buildEmailContent('payment_failed', baseCtx)
    expect(text.toLowerCase()).toContain("didn't go through")
    expect(text.toLowerCase()).not.toContain('confirmed')
  })

  it('booking_expired explains the hold was released', () => {
    const { text } = buildEmailContent('booking_expired', baseCtx)
    expect(text.toLowerCase()).toContain('expired')
    expect(text.toLowerCase()).toContain('released')
  })

  it('omits the phone line entirely when contactPhone is null (never invents one)', () => {
    const { text, html } = buildEmailContent('booking_confirmed', { ...baseCtx, contactPhone: null })
    expect(text).not.toMatch(/·\s*$/)
    expect(html).not.toContain('null')
    expect(text).not.toContain('null')
  })

  it('includes the phone line when contactPhone is actually provided', () => {
    const { text } = buildEmailContent('booking_confirmed', { ...baseCtx, contactPhone: '555-123-4567' })
    expect(text).toContain('555-123-4567')
  })

  it('omits remaining balance line when not provided (e.g. full_payment deposit)', () => {
    const ctx = { ...baseCtx, remainingBalanceCents: undefined }
    const { text } = buildEmailContent('booking_confirmed', ctx)
    expect(text).not.toContain('Remaining balance')
  })

  it('never fabricates cancellation or deposit policy wording', () => {
    for (const type of ['booking_payment_pending', 'booking_confirmed', 'payment_failed', 'booking_expired']) {
      const { text } = buildEmailContent(type, baseCtx)
      expect(text.toLowerCase()).not.toContain('cancellation policy')
      expect(text.toLowerCase()).not.toContain('deposit policy')
      expect(text.toLowerCase()).not.toContain('non-refundable')
    }
  })
})
