// Pure idempotency decision for notification sending — given the existing
// notification_events row (or null), decide whether to send, skip, or
// retry. No I/O; fully unit-testable.

/**
 * @param {{status: 'pending'|'sent'|'failed', retry_count: number} | null} existingRow
 * @param {number} [maxRetries=5]
 * @returns {'send' | 'skip'}
 */
export function decideNotificationAction(existingRow, maxRetries = 5) {
  if (!existingRow) return 'send'
  if (existingRow.status === 'sent') return 'skip'
  if (existingRow.status === 'failed' && existingRow.retry_count >= maxRetries) return 'skip'
  // 'pending' (a previous attempt never got as far as recording an
  // outcome — safe to retry) or 'failed' under the retry cap.
  return 'send'
}

/**
 * The confirmation email specifically must never fire before the
 * appointment is actually confirmed in the database — this is checked
 * independently of the general send/skip decision above, as a second,
 * explicit safety net matching the milestone's hard requirement.
 */
export function canSendConfirmationEmail(appointment) {
  return appointment?.status === 'confirmed'
}
