// Branded HTML email templates — composed from brand/components.js. This
// module is DELIBERATELY separate from ../content.js (the plain templates
// currently wired into send.js and already sending real email as of
// Milestone 6). Nothing here is used by live sending yet — per instruction,
// real transactional delivery stays on the plain templates until these are
// visually approved; swapping send.js's import is a small, isolated change
// for a later step.
//
// As with every other template in this codebase: no cancellation/deposit
// policy text, no address, no phone number is invented — optional fields
// are simply omitted when the caller doesn't supply them.
import { brand } from './tokens.js'
import {
  emailShell,
  header,
  hero,
  paragraph,
  bookingSummaryCard,
  paymentSummaryCard,
  ctaButton,
  textLink,
  preparationNote,
  footer,
} from './components.js'

export class BrandedEmailError extends Error {}

function firstName(fullName) {
  if (!fullName) return 'there'
  return String(fullName).trim().split(/\s+/)[0]
}

function requireCtx(ctx, fields) {
  const missing = fields.filter((f) => !ctx?.[f])
  if (missing.length) {
    throw new BrandedEmailError(`Missing required template fields: ${missing.join(', ')}`)
  }
}

function footerRow(ctx) {
  return footer({
    businessName: ctx.businessName,
    locationLine: ctx.locationLine,
    contactEmail: ctx.contactEmail,
    contactPhone: ctx.contactPhone,
  })
}

// --- 1. Booking received / payment pending ---------------------------------
function paymentPendingTemplate(ctx) {
  requireCtx(ctx, ['customerName', 'serviceName', 'dateLabel', 'timeLabel', 'appointmentReference'])
  const rows = [
    header(),
    hero({ eyebrow: 'Booking Request Received', title: 'Your appointment is', italicTail: 'being held for you' }),
    paragraph(
      `Hi ${firstName(ctx.customerName)}, thank you for booking with ${ctx.businessName}! Your spot is reserved temporarily while payment completes — it isn't confirmed yet.`
    ),
    bookingSummaryCard({
      serviceName: ctx.serviceName,
      dateLabel: ctx.dateLabel,
      timeLabel: ctx.timeLabel,
      durationLabel: ctx.durationLabel,
      reference: ctx.appointmentReference,
    }),
    paymentSummaryCard({
      amountLabel: 'Amount due now',
      amountValue: ctx.amountDueNowLabel,
      remainingLabel: 'Remaining balance',
      remainingValue: ctx.remainingBalanceLabel,
    }),
    ctx.paymentUrl ? ctaButton({ href: ctx.paymentUrl, label: 'Complete Payment' }) : paragraph("You'll receive another email once payment is confirmed.", { color: brand.colors.faintText }),
    footerRow(ctx),
  ]
  return {
    subject: `Your booking request with ${ctx.businessName} — payment pending`,
    html: emailShell({
      title: 'Booking request received',
      preheaderText: `Your spot is held — complete payment to confirm your ${ctx.serviceName} appointment.`,
      rows,
    }),
  }
}

// --- 2. Booking confirmed ---------------------------------------------------
function confirmedTemplate(ctx) {
  requireCtx(ctx, ['customerName', 'serviceName', 'dateLabel', 'timeLabel', 'appointmentReference'])
  const rows = [
    header(),
    hero({ eyebrow: 'Confirmed', title: 'Your appointment is', italicTail: 'confirmed!' }),
    paragraph(`Hi ${firstName(ctx.customerName)}, we can't wait to see you! Here's your appointment summary:`),
    bookingSummaryCard({
      serviceName: ctx.serviceName,
      dateLabel: ctx.dateLabel,
      timeLabel: ctx.timeLabel,
      durationLabel: ctx.durationLabel,
      reference: ctx.appointmentReference,
    }),
    paymentSummaryCard({
      amountLabel: 'Amount paid',
      amountValue: ctx.amountPaidLabel,
      remainingLabel: 'Remaining balance (due at appointment)',
      remainingValue: ctx.remainingBalanceLabel,
    }),
    ctx.addToCalendarUrl ? ctaButton({ href: ctx.addToCalendarUrl, label: 'Add to Calendar' }) : '',
    ctx.bookingDetailsUrl ? textLink({ href: ctx.bookingDetailsUrl, label: 'View booking details' }) : '',
    footerRow(ctx),
  ]
  return {
    subject: `You're booked — ${ctx.businessName}`,
    html: emailShell({
      title: "You're booked",
      preheaderText: `Confirmed: ${ctx.serviceName} on ${ctx.dateLabel} at ${ctx.timeLabel}.`,
      rows,
    }),
  }
}

// --- 3. Payment failed -------------------------------------------------------
function paymentFailedTemplate(ctx) {
  requireCtx(ctx, ['customerName', 'serviceName', 'dateLabel', 'timeLabel', 'appointmentReference'])
  const rows = [
    header(),
    hero({ eyebrow: 'Payment Issue', title: "Let's get that", italicTail: 'sorted out' }),
    paragraph(
      `Hi ${firstName(ctx.customerName)}, we weren't able to process your payment for the appointment below. No charge was made, and your spot is still being held for now.`
    ),
    bookingSummaryCard({
      serviceName: ctx.serviceName,
      dateLabel: ctx.dateLabel,
      timeLabel: ctx.timeLabel,
      reference: ctx.appointmentReference,
    }),
    ctx.paymentUrl
      ? ctaButton({ href: ctx.paymentUrl, label: 'Try Payment Again' })
      : paragraph('Please try again with a different payment method.', { color: brand.colors.faintText }),
    footerRow(ctx),
  ]
  return {
    subject: `Payment didn't go through — ${ctx.businessName}`,
    html: emailShell({
      title: 'Payment issue',
      preheaderText: `We couldn't process payment for your ${ctx.serviceName} appointment — no charge was made.`,
      rows,
    }),
  }
}

// --- 4. Booking hold expired --------------------------------------------------
// Mirrors the `booking_expired` type that ../content.js already sends, so the
// branded set covers every type live sending can produce. Deliberately plain
// and non-accusatory: the copy states what happened and how to rebook, and
// never claims a charge was made.
function expiredTemplate(ctx) {
  requireCtx(ctx, ['customerName', 'serviceName', 'dateLabel', 'timeLabel', 'appointmentReference'])
  const rows = [
    header(),
    hero({ eyebrow: 'Hold Released', title: 'That time slot has', italicTail: 'been released' }),
    paragraph(
      `Hi ${firstName(ctx.customerName)}, the time we were holding for you has expired since payment wasn't completed. The slot is open again — you're very welcome to rebook it.`
    ),
    bookingSummaryCard({
      serviceName: ctx.serviceName,
      dateLabel: ctx.dateLabel,
      timeLabel: ctx.timeLabel,
      reference: ctx.appointmentReference,
    }),
    ctx.rebookUrl
      ? ctaButton({ href: ctx.rebookUrl, label: 'Book Again' })
      : paragraph('You can start a new booking whenever you’re ready.', {
          color: brand.colors.faintText,
        }),
    footerRow(ctx),
  ]
  return {
    subject: `Your booking hold has expired — ${ctx.businessName}`,
    html: emailShell({
      title: 'Booking hold expired',
      preheaderText: `The hold on your ${ctx.serviceName} slot has expired — rebook anytime.`,
      rows,
    }),
  }
}

// --- 5. Appointment reminder --------------------------------------------------
function reminderTemplate(ctx) {
  requireCtx(ctx, ['customerName', 'serviceName', 'dateLabel', 'timeLabel', 'appointmentReference'])
  const rows = [
    header(),
    hero({ eyebrow: 'Reminder', title: 'See you', italicTail: 'soon!' }),
    paragraph(`Hi ${firstName(ctx.customerName)}, just a friendly reminder about your upcoming appointment:`),
    bookingSummaryCard({
      serviceName: ctx.serviceName,
      dateLabel: ctx.dateLabel,
      timeLabel: ctx.timeLabel,
      durationLabel: ctx.durationLabel,
      reference: ctx.appointmentReference,
    }),
    preparationNote(ctx.preparationNote),
    ctx.bookingDetailsUrl ? textLink({ href: ctx.bookingDetailsUrl, label: 'View booking details' }) : '',
    footerRow(ctx),
  ]
  return {
    subject: `See you soon — your ${ctx.serviceName} appointment`,
    html: emailShell({
      title: 'Appointment reminder',
      preheaderText: `Reminder: ${ctx.serviceName} on ${ctx.dateLabel} at ${ctx.timeLabel}.`,
      rows,
    }),
  }
}

const TEMPLATES = {
  booking_payment_pending: paymentPendingTemplate,
  booking_confirmed: confirmedTemplate,
  payment_failed: paymentFailedTemplate,
  booking_expired: expiredTemplate,
  appointment_reminder: reminderTemplate,
}

/**
 * @param {'booking_payment_pending'|'booking_confirmed'|'payment_failed'|'booking_expired'|'appointment_reminder'} type
 * @param {object} ctx - business + booking data; see individual templates for required fields
 * @returns {{subject: string, html: string}}
 */
export function buildBrandedEmailContent(type, ctx) {
  const template = TEMPLATES[type]
  if (!template) {
    throw new BrandedEmailError(`Unknown branded email type: ${type}`)
  }
  return template(ctx)
}

export const BRANDED_EMAIL_TYPES = Object.keys(TEMPLATES)
