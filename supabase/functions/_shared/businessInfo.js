// Server-side mirror of the business facts needed in email/ICS content.
// Duplicated intentionally from src/config/business.js — Deno functions
// can't cross the Vite "@/" alias boundary (same rationale as
// BUSINESS_TIMEZONE in create-booking/index.ts). Keep in sync manually.
//
// Only include facts that are actually confirmed. contactPhone is now set
// (confirmed by Emmanuelle) — templates include it. Do not add
// cancellation/deposit policy wording here — that content doesn't exist
// yet and must not be fabricated in notification templates either.
export const businessInfo = {
  // Trading name, matching the official brand mark and
  // src/config/business.js (Milestone 6.5). `artistName` is kept separate
  // because it is biography rather than branding.
  name: 'Makeup-by Emma',
  artistName: 'Emmanuelle Singani',
  locationLine: '60 Susa Dr, Suite 121, Stafford, VA 22554',
  contactEmail: 'emmanuellesingani23@gmail.com',
  contactPhone: '+15712669829',
  timezone: 'America/New_York',
}
