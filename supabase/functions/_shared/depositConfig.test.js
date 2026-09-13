import { describe, it, expect } from 'vitest'
import { calculateDeposit, depositConfig } from './depositConfig.js'

describe('calculateDeposit', () => {
  it('uses the confirmed $50 fixed deposit by default', () => {
    expect(depositConfig).toEqual({ type: 'fixed', value: 5000, isConfirmed: true })
    expect(calculateDeposit(13000)).toMatchObject({
      amountDueNowCents: 5000,
      remainingBalanceCents: 8000,
      depositType: 'fixed',
      depositValue: 5000,
    })
  })

  it('computes a percentage deposit and rounds to the nearest cent', () => {
    const result = calculateDeposit(12500, { type: 'percentage', value: 30 })
    expect(result).toEqual({
      amountDueNowCents: 3750,
      remainingBalanceCents: 8750,
      depositType: 'percentage',
      depositValue: 30,
    })
  })

  it('rounds a percentage deposit that does not divide evenly', () => {
    // 10001 * 0.3 = 3000.3 -> rounds to 3000
    const result = calculateDeposit(10001, { type: 'percentage', value: 30 })
    expect(result.amountDueNowCents).toBe(3000)
    expect(result.remainingBalanceCents).toBe(7001)
  })

  it('computes a fixed deposit', () => {
    const result = calculateDeposit(20000, { type: 'fixed', value: 5000 })
    expect(result.amountDueNowCents).toBe(5000)
    expect(result.remainingBalanceCents).toBe(15000)
  })

  it('clamps a fixed deposit larger than the service price to the full price', () => {
    const result = calculateDeposit(3000, { type: 'fixed', value: 5000 })
    expect(result.amountDueNowCents).toBe(3000)
    expect(result.remainingBalanceCents).toBe(0)
  })

  it('computes full_payment as the entire service price, remaining balance zero', () => {
    const result = calculateDeposit(15000, { type: 'full_payment', value: 0 })
    expect(result.amountDueNowCents).toBe(15000)
    expect(result.remainingBalanceCents).toBe(0)
  })

  it('handles a 0% deposit (nothing due now)', () => {
    const result = calculateDeposit(10000, { type: 'percentage', value: 0 })
    expect(result.amountDueNowCents).toBe(0)
    expect(result.remainingBalanceCents).toBe(10000)
  })

  it('handles a 100% deposit the same as full_payment', () => {
    const result = calculateDeposit(10000, { type: 'percentage', value: 100 })
    expect(result.amountDueNowCents).toBe(10000)
    expect(result.remainingBalanceCents).toBe(0)
  })

  it('rejects a percentage outside 0-100', () => {
    expect(() => calculateDeposit(10000, { type: 'percentage', value: 150 })).toThrow()
    expect(() => calculateDeposit(10000, { type: 'percentage', value: -5 })).toThrow()
  })

  it('rejects a negative fixed deposit', () => {
    expect(() => calculateDeposit(10000, { type: 'fixed', value: -100 })).toThrow()
  })

  it('rejects an unknown deposit type', () => {
    expect(() => calculateDeposit(10000, { type: 'bogus', value: 10 })).toThrow()
  })

  it('rejects a non-integer or negative service price', () => {
    expect(() => calculateDeposit(-100, { type: 'fixed', value: 10 })).toThrow()
    expect(() => calculateDeposit(99.5, { type: 'fixed', value: 10 })).toThrow()
  })

  it('amountDueNowCents + remainingBalanceCents always equals the service price', () => {
    for (const config of [
      { type: 'fixed', value: 2500 },
      { type: 'percentage', value: 17 },
      { type: 'full_payment', value: 0 },
    ]) {
      const { amountDueNowCents, remainingBalanceCents } = calculateDeposit(9999, config)
      expect(amountDueNowCents + remainingBalanceCents).toBe(9999)
    }
  })
})
