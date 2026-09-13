// Pure email content builders — zero imports, fully unit-testable. Only
// ever renders data explicitly passed in; never invents cancellation/
// deposit policy wording, an address, or a phone number. Optional fields
// (e.g. contactPhone, remainingBalanceCents) are omitted from the output
// entirely when absent, rather than rendered as a broken/blank line.

import { formatPhoneLabel } from '../formatting.js'

export class NotificationContentError extends Error {}

function money(cents) {
  if (typeof cents !== 'number') return null
  return `$${(cents / 100).toFixed(2)}`
}

function line(label, value) {
  return value ? `${label}: ${value}\n` : ''
}

function htmlLine(label, value) {
  return value ? `<p style="margin:4px 0"><strong>${label}:</strong> ${value}</p>` : ''
}

/**
 * @param {object} ctx
 * @param {string} ctx.businessName
 * @param {string} ctx.locationLine
 * @param {string} ctx.contactEmail
 * @param {string|null} [ctx.contactPhone]
 * @param {string} ctx.customerName
 * @param {string} ctx.serviceName
 * @param {string} ctx.dateLabel - already formatted, business-timezone
 * @param {string} ctx.timeLabel - already formatted, business-timezone
 * @param {string} [ctx.durationLabel]
 * @param {string} ctx.appointmentReference
 * @param {number} [ctx.amountDueNowCents]
 * @param {number} [ctx.remainingBalanceCents]
 * @param {number} [ctx.amountPaidCents]
 */
function baseContext(ctx) {
  if (!ctx || !ctx.customerName || !ctx.serviceName || !ctx.appointmentReference) {
    throw new NotificationContentError('Missing required notification context fields')
  }
  return ctx
}

function footer(ctx) {
  const phoneLabel = formatPhoneLabel(ctx.contactPhone)
  return {
    text: `\n${ctx.locationLine}\nQuestions? ${ctx.contactEmail}${ctx.contactPhone ? ' · ' + phoneLabel : ''}\n`,
    html: `<p style="margin-top:20px;color:#8A7A6C;font-size:12px">${ctx.locationLine}<br>Questions? ${ctx.contactEmail}${
      ctx.contactPhone ? ` · <a href="tel:${ctx.contactPhone}" style="color:#8A7A6C">${phoneLabel}</a>` : ''
    }</p>`,
  }
}

function paymentPendingEmail(ctxRaw) {
  const ctx = baseContext(ctxRaw)
  const f = footer(ctx)
  const subject = `Your booking request with ${ctx.businessName} — payment pending`
  const text =
    `Hi ${ctx.customerName},\n\n` +
    `We received your booking request. It isn't confirmed yet — it's held for you while payment completes.\n\n` +
    line('Service', ctx.serviceName) +
    line('Date', ctx.dateLabel) +
    line('Time', ctx.timeLabel) +
    line('Duration', ctx.durationLabel) +
    line('Amount due now', money(ctx.amountDueNowCents)) +
    line('Remaining balance', money(ctx.remainingBalanceCents)) +
    line('Reference', ctx.appointmentReference) +
    `\nYou'll get another email once payment is confirmed.\n` +
    f.text
  const html =
    `<p>Hi ${ctx.customerName},</p>` +
    `<p>We received your booking request. It isn't confirmed yet — it's held for you while payment completes.</p>` +
    htmlLine('Service', ctx.serviceName) +
    htmlLine('Date', ctx.dateLabel) +
    htmlLine('Time', ctx.timeLabel) +
    htmlLine('Duration', ctx.durationLabel) +
    htmlLine('Amount due now', money(ctx.amountDueNowCents)) +
    htmlLine('Remaining balance', money(ctx.remainingBalanceCents)) +
    htmlLine('Reference', ctx.appointmentReference) +
    `<p>You'll get another email once payment is confirmed.</p>` +
    f.html
  return { subject, text, html }
}

function confirmedEmail(ctxRaw) {
  const ctx = baseContext(ctxRaw)
  const f = footer(ctx)
  const subject = `You're booked — ${ctx.businessName}`
  const text =
    `Hi ${ctx.customerName},\n\n` +
    `Your booking is confirmed.\n\n` +
    line('Service', ctx.serviceName) +
    line('Date', ctx.dateLabel) +
    line('Time', ctx.timeLabel) +
    line('Duration', ctx.durationLabel) +
    line('Amount paid', money(ctx.amountPaidCents)) +
    line('Remaining balance (due at appointment)', money(ctx.remainingBalanceCents)) +
    line('Reference', ctx.appointmentReference) +
    f.text
  const html =
    `<p>Hi ${ctx.customerName},</p>` +
    `<p>Your booking is confirmed.</p>` +
    htmlLine('Service', ctx.serviceName) +
    htmlLine('Date', ctx.dateLabel) +
    htmlLine('Time', ctx.timeLabel) +
    htmlLine('Duration', ctx.durationLabel) +
    htmlLine('Amount paid', money(ctx.amountPaidCents)) +
    htmlLine('Remaining balance (due at appointment)', money(ctx.remainingBalanceCents)) +
    htmlLine('Reference', ctx.appointmentReference) +
    f.html
  return { subject, text, html }
}

function paymentFailedEmail(ctxRaw) {
  const ctx = baseContext(ctxRaw)
  const f = footer(ctx)
  const subject = `Payment didn't go through — ${ctx.businessName}`
  const text =
    `Hi ${ctx.customerName},\n\n` +
    `Your payment for the appointment below didn't go through. Your booking request is still held for now — ` +
    `please try again with a different payment method.\n\n` +
    line('Service', ctx.serviceName) +
    line('Date', ctx.dateLabel) +
    line('Time', ctx.timeLabel) +
    line('Reference', ctx.appointmentReference) +
    f.text
  const html =
    `<p>Hi ${ctx.customerName},</p>` +
    `<p>Your payment for the appointment below didn't go through. Your booking request is still held for now — ` +
    `please try again with a different payment method.</p>` +
    htmlLine('Service', ctx.serviceName) +
    htmlLine('Date', ctx.dateLabel) +
    htmlLine('Time', ctx.timeLabel) +
    htmlLine('Reference', ctx.appointmentReference) +
    f.html
  return { subject, text, html }
}

function expiredEmail(ctxRaw) {
  const ctx = baseContext(ctxRaw)
  const f = footer(ctx)
  const subject = `Your booking hold has expired — ${ctx.businessName}`
  const text =
    `Hi ${ctx.customerName},\n\n` +
    `The time we were holding for you has expired since payment wasn't completed in time. ` +
    `The slot has been released — please rebook if you'd still like it.\n\n` +
    line('Service', ctx.serviceName) +
    line('Date', ctx.dateLabel) +
    line('Time', ctx.timeLabel) +
    line('Reference', ctx.appointmentReference) +
    f.text
  const html =
    `<p>Hi ${ctx.customerName},</p>` +
    `<p>The time we were holding for you has expired since payment wasn't completed in time. ` +
    `The slot has been released — please rebook if you'd still like it.</p>` +
    htmlLine('Service', ctx.serviceName) +
    htmlLine('Date', ctx.dateLabel) +
    htmlLine('Time', ctx.timeLabel) +
    htmlLine('Reference', ctx.appointmentReference) +
    f.html
  return { subject, text, html }
}

const BUILDERS = {
  booking_payment_pending: paymentPendingEmail,
  booking_confirmed: confirmedEmail,
  payment_failed: paymentFailedEmail,
  booking_expired: expiredEmail,
}

export function buildEmailContent(notificationType, ctx) {
  const builder = BUILDERS[notificationType]
  if (!builder) {
    throw new NotificationContentError(`Unknown notification type: ${notificationType}`)
  }
  return builder(ctx)
}
