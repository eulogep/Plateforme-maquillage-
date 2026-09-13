// Server-authoritative deposit configuration. The client may DISPLAY these
// numbers, but never dictates the deposit type/value or the resulting
// charge amount — every amount Stripe is ever asked to charge comes from
// calculateDeposit() below, run server-side against the service's
// authoritative price_cents.
//
// Confirmed by the client on 2026-09-10. Fixed values are stored in cents;
// every appointment snapshots the values used at payment-creation time.
export const depositConfig = {
  // 'fixed' (deposit_value is a flat cents amount) | 'percentage'
  // (deposit_value is 0-100) | 'full_payment' (the whole service price is
  // due now, deposit_value is ignored).
  type: 'fixed',
  value: 5000,
  isConfirmed: true,
}

/**
 * Computes { amountDueNowCents, remainingBalanceCents } from an
 * authoritative service price (integer cents) and a deposit config.
 * Pure function — no I/O, fully unit-testable.
 */
export function calculateDeposit(servicePriceCents, config = depositConfig) {
  if (!Number.isInteger(servicePriceCents) || servicePriceCents < 0) {
    throw new Error('servicePriceCents must be a non-negative integer (cents)')
  }

  let amountDueNowCents
  switch (config.type) {
    case 'fixed':
      if (!Number.isFinite(config.value) || config.value < 0) {
        throw new Error('fixed deposit value must be a non-negative number')
      }
      amountDueNowCents = Math.round(config.value)
      break
    case 'percentage':
      if (!Number.isFinite(config.value) || config.value < 0 || config.value > 100) {
        throw new Error('percentage deposit value must be between 0 and 100')
      }
      amountDueNowCents = Math.round((servicePriceCents * config.value) / 100)
      break
    case 'full_payment':
      amountDueNowCents = servicePriceCents
      break
    default:
      throw new Error(`Unknown deposit type: ${config.type}`)
  }

  // Clamp: never charge more than the service price, never negative —
  // protects against a misconfigured fixed deposit exceeding the price.
  amountDueNowCents = Math.max(0, Math.min(amountDueNowCents, servicePriceCents))
  const remainingBalanceCents = servicePriceCents - amountDueNowCents

  return {
    amountDueNowCents,
    remainingBalanceCents,
    depositType: config.type,
    depositValue: config.value,
  }
}
