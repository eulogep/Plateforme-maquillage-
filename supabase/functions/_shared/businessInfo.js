// Server-side mirror of the business facts needed in email/ICS content.
// Duplicated intentionally from src/config/business.js — Deno functions
// can't cross the Vite "@/" alias boundary (same rationale as
// BUSINESS_TIMEZONE in create-booking/index.ts). Keep in sync manually.
//
// Confirmed business facts used by notification templates. `contactPhone`
// is the primary number; both confirmed numbers are shown on the website.
export const businessInfo = {
  // Trading name, matching the official brand mark and
  // src/config/business.js (Milestone 6.5). `artistName` is kept separate
  // because it is biography rather than branding.
  name: 'Makeup-by Emma',
  artistName: 'Emmanuelle Singani',
  locationLine: '60 Susa Dr, Suite 121, Stafford, VA 22554',
  contactEmail: 'makeupbyemma2020@gmail.com',
  contactPhone: '+15712669829',
  timezone: 'America/New_York',
}
