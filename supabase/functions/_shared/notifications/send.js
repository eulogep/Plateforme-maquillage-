// Orchestrates one notification attempt: idempotency check, content
// build, send via Resend, and status recording — never throws (a caller
// awaits this for ordering, but a failure here must never roll back or
// fail the booking/payment operation that triggered it).
import { buildEmailContent } from './content.js'
import { decideNotificationAction, canSendConfirmationEmail } from './decision.js'
import { sendEmailViaResend } from './resendClient.js'

/**
 * @param {object} params
 * @param {object} params.supabaseAdmin
 * @param {string} params.appointmentId
 * @param {'booking_payment_pending'|'booking_confirmed'|'payment_failed'|'booking_expired'} params.notificationType
 * @param {object} params.templateContext - passed straight to buildEmailContent
 * @param {object|null} [params.appointmentForConfirmationGuard] - required (and checked) only when notificationType is 'booking_confirmed'
 * @param {string} params.to
 * @param {string} params.resendApiKey
 * @param {string} params.resendFrom
 * @returns {Promise<{ action: 'sent'|'skipped'|'failed'|'blocked', reason?: string }>}
 */
export async function sendNotification({
  supabaseAdmin,
  appointmentId,
  notificationType,
  templateContext,
  appointmentForConfirmationGuard,
  to,
  resendApiKey,
  resendFrom,
}) {
  try {
    if (notificationType === 'booking_confirmed' && !canSendConfirmationEmail(appointmentForConfirmationGuard)) {
      return { action: 'blocked', reason: 'appointment_not_confirmed' }
    }

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('notification_events')
      .select('id,status,retry_count')
      .eq('appointment_id', appointmentId)
      .eq('notification_type', notificationType)
      .maybeSingle()
    if (fetchError) throw fetchError

    const action = decideNotificationAction(existing)
    if (action === 'skip') {
      return { action: 'skipped', reason: existing?.status === 'sent' ? 'already_sent' : 'retry_cap_reached' }
    }

    if (!resendApiKey) {
      // Not configured in this environment — record as failed/pending so
      // it's visible and retryable once it is, without blocking anything.
      await upsertOutcome(supabaseAdmin, appointmentId, notificationType, existing, {
        status: 'failed',
        last_error: 'RESEND_API_KEY not configured',
      })
      return { action: 'failed', reason: 'not_configured' }
    }

    const content = buildEmailContent(notificationType, templateContext)
    const result = await sendEmailViaResend({
      apiKey: resendApiKey,
      from: resendFrom,
      to,
      subject: content.subject,
      html: content.html,
      text: content.text,
    })

    if (result.ok) {
      await upsertOutcome(supabaseAdmin, appointmentId, notificationType, existing, {
        status: 'sent',
        provider_message_id: result.messageId,
        sent_at: new Date().toISOString(),
      })
      return { action: 'sent' }
    }

    await upsertOutcome(supabaseAdmin, appointmentId, notificationType, existing, {
      status: 'failed',
      last_error: result.error,
    })
    return { action: 'failed', reason: result.error }
  } catch (err) {
    // Genuinely unexpected (DB error, etc.) — still never throw upward.
    console.error('sendNotification unexpected error', notificationType, appointmentId, err)
    return { action: 'failed', reason: err?.message ?? 'unexpected_error' }
  }
}

async function upsertOutcome(supabaseAdmin, appointmentId, notificationType, existing, patch) {
  if (existing) {
    const { error } = await supabaseAdmin
      .from('notification_events')
      .update({ ...patch, retry_count: (existing.retry_count ?? 0) + (patch.status === 'failed' ? 1 : 0) })
      .eq('id', existing.id)
    if (error) console.error('failed to update notification_events', error)
  } else {
    const { error } = await supabaseAdmin.from('notification_events').insert({
      appointment_id: appointmentId,
      notification_type: notificationType,
      ...patch,
    })
    if (error) console.error('failed to insert notification_events', error)
  }
}
