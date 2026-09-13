import { describe, it, expect } from 'vitest'
import { decideNotificationAction, canSendConfirmationEmail } from './decision.js'

describe('decideNotificationAction', () => {
  it('sends when no row exists yet', () => {
    expect(decideNotificationAction(null)).toBe('send')
  })

  it('skips when already sent — this is the webhook-replay dedup guarantee', () => {
    expect(decideNotificationAction({ status: 'sent', retry_count: 0 })).toBe('skip')
  })

  it('sends (retries) a failed attempt under the retry cap', () => {
    expect(decideNotificationAction({ status: 'failed', retry_count: 1 })).toBe('send')
  })

  it('skips a failed attempt once the retry cap is reached', () => {
    expect(decideNotificationAction({ status: 'failed', retry_count: 5 }, 5)).toBe('skip')
  })

  it('retries a stuck pending row (a previous attempt that never recorded an outcome)', () => {
    expect(decideNotificationAction({ status: 'pending', retry_count: 0 })).toBe('send')
  })

  it('respects a custom retry cap', () => {
    expect(decideNotificationAction({ status: 'failed', retry_count: 2 }, 2)).toBe('skip')
    expect(decideNotificationAction({ status: 'failed', retry_count: 1 }, 2)).toBe('send')
  })
})

describe('canSendConfirmationEmail', () => {
  it('allows only a genuinely confirmed appointment', () => {
    expect(canSendConfirmationEmail({ status: 'confirmed' })).toBe(true)
  })

  it.each(['pending', 'payment_pending', 'expired', 'cancelled', 'completed', 'no_show'])(
    'blocks a %s appointment',
    (status) => {
      expect(canSendConfirmationEmail({ status })).toBe(false)
    }
  )

  it('blocks when the appointment is missing entirely', () => {
    expect(canSendConfirmationEmail(null)).toBe(false)
  })
})
