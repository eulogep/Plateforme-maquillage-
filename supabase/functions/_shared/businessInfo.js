// Server-side mirror of the business facts needed in email/ICS content.
// Duplicated intentionally from src/config/business.js — Deno functions
// can't cross the Vite "@/" alias boundary (same rationale as
// BUSINESS_TIMEZONE in create-booking/index.ts). Keep in sync manually.
//
// Only include facts that are actually confirmed. contactPhone stays null
// because the design itself marks it "[PHONE TO BE CONFIRMED]" — templates
// must omit it rather than invent a number. Do not add cancellation/
// deposit policy wording here — that content doesn't exist yet and must
// not be fabricated in notification templates either.
export const businessInfo = {
  name: 'Emmanuelle Singani',
  locationLine: '60 Susa Dr, Suite 121, Stafford, VA 22554',
  contactEmail: 'emmanuellesingani23@gmail.com',
  contactPhone: null,
  timezone: 'America/New_York',
}
