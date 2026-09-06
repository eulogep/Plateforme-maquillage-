#!/usr/bin/env node
// Local preview workflow for the branded email templates. Renders every
// template in BRANDED_EMAIL_TYPES with realistic sample data to standalone
// .html files you can open directly in a browser (or drag into Gmail's
// "view original"-style tools) — no server, no sending, nothing live.
//
// Usage:
//   node supabase/functions/_shared/notifications/brand/preview.mjs
//   open supabase/functions/_shared/notifications/brand/.preview/booking_confirmed.html
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { buildBrandedEmailContent, BRANDED_EMAIL_TYPES } from './templates.js'

const outDir = join(dirname(fileURLToPath(import.meta.url)), '.preview')
mkdirSync(outDir, { recursive: true })

// Realistic but clearly-fictional sample data — never real customer data.
// The reminder template's preparationNote is intentionally left as a
// bracketed placeholder, same convention as the rest of this codebase for
// content Emmanuelle hasn't confirmed yet.
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
  appointmentReference: 'e3b0c442-98fc-4e1b-9a2f-3f1a2b3c4d5e',
  amountDueNowLabel: '$37.50',
  remainingBalanceLabel: '$87.50',
  amountPaidLabel: '$37.50',
  paymentUrl: 'https://emmanuellesingani.com/pay/e3b0c442-98fc-4e1b-9a2f-3f1a2b3c4d5e',
  addToCalendarUrl: 'https://emmanuellesingani.com/ics/e3b0c442-98fc-4e1b-9a2f-3f1a2b3c4d5e',
  bookingDetailsUrl: 'https://emmanuellesingani.com/booking/e3b0c442-98fc-4e1b-9a2f-3f1a2b3c4d5e',
}

for (const type of BRANDED_EMAIL_TYPES) {
  const ctx = type === 'appointment_reminder' ? { ...baseCtx, preparationNote: "[Preparation guidance — pending Emmanuelle's confirmation]" } : baseCtx
  const { subject, html } = buildBrandedEmailContent(type, ctx)
  writeFileSync(join(outDir, `${type}.html`), html)
  console.log(`✓ ${type} -> .preview/${type}.html  (subject: "${subject}")`)
}

console.log(`\nRendered ${BRANDED_EMAIL_TYPES.length} templates to ${outDir}`)
console.log('Open any .html file directly in a browser to preview it.')
