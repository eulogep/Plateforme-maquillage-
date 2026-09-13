// Centralized business content/config for the marketing site.
//
// This is the single source of truth for services, pricing, policies,
// location/contact, and the still-open placeholders — so components stay
// presentational and Emmanuelle's real business facts live in one place
// instead of being scattered across JSX.
//
// Source of truth: design-reference/ (the frozen Claude Design homepage).
// Anything the design itself marks as pending confirmation is kept as an
// explicit placeholder here rather than invented. Do not fill these in
// without Emmanuelle's sign-off.

export const business = {
  // The trading name is the one carried by the official brand mark
  // (Milestone 6.5). Emmanuelle's personal name is kept separately: it
  // still belongs in the About section, where it is biography rather than
  // branding.
  name: 'Makeup-by Emma',
  artistName: 'Emmanuelle Singani',
  tagline: 'Makeup Artist',
  location: {
    line1: '60 Susa Dr, Suite 121',
    city: 'Stafford',
    state: 'VA',
    zip: '22554',
    full: '60 Susa Dr, Suite 121, Stafford, VA 22554',
    areaServed: 'Fredericksburg & the DMV',
    // Stafford, VA is unambiguously in the US Eastern time zone — this is a
    // geographic fact, not an unconfirmed business preference, so it's set
    // explicitly here rather than left as a placeholder. All availability
    // computation must use this, never the visitor's browser time zone.
    timezone: 'America/New_York',
  },
  contact: {
    email: 'emmanuellesingani23@gmail.com',
    // Confirmed by Emmanuelle. Stored E.164 (+1 US); components format it
    // for display and build the tel: link from this value.
    phone: '+15712669829',
  },
  social: {
    instagram: ['https://www.instagram.com/emma_sing84', 'https://www.instagram.com/emma_sing2'],
    facebook: 'https://www.facebook.com/profile.php?id=100008196917547',
  },
  // Deposit structure (fixed $ vs %) is explicitly unconfirmed in the design
  // ("[DEPOSIT — fixed $ or % TBC]"). Left null on purpose — nothing in the
  // client reads this to compute an amount. As of Milestone 5, the actual
  // (still-unconfirmed, dev/test) deposit configuration and calculation
  // live server-side only, in supabase/functions/_shared/depositConfig.js
  // — the client only ever displays whatever amount create-payment-intent
  // returns, never computes one itself.
  deposit: {
    type: null, // 'fixed' | 'percent'
    value: null,
    note: 'Deposit amount/structure pending confirmation with Emmanuelle.',
  },
}

// Formats business.contact.phone (stored E.164, e.g. "+15712669829") as a
// familiar US display string: "(571) 266-9829". Returns null unchanged if
// no number is set, so callers can keep using the existing
// "not yet confirmed" branch without a separate null check.
export function formatBusinessPhone(e164) {
  if (!e164) return null
  const digits = e164.replace(/\D/g, '').replace(/^1/, '')
  if (digits.length !== 10) return e164
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

// Primary services shown as image-led cards. Prices are explicitly called
// out as placeholders in the approved design ("Placeholder pricing — to be
// validated with Emmanuelle.") — see `pricingDisclaimer` below, which
// components should render alongside any price.
export const services = [
  {
    id: 'natural-glam',
    name: 'Natural Glam',
    headline: 'Natural Glam',
    duration: '45 min',
    priceFrom: 85,
    description: 'Fresh, barely-there enhancement.',
    cta: 'Book Natural Glam →',
    image: 'look-natural-glam',
  },
  {
    id: 'soft-glam',
    name: 'Soft Glam',
    // The frozen design's card headline reads "Timeless picture" while the
    // CTA/footer/booking flow all say "Soft Glam" — preserved as-is rather
    // than "corrected", since this is the approved source content.
    headline: 'Timeless picture',
    duration: '60 min',
    priceFrom: 125,
    description: 'Natural, luminous, everyday-elegant.',
    cta: 'Book Soft Glam →',
    image: 'look-timeless',
  },
  {
    id: 'full-glam',
    name: 'Full Glam',
    headline: 'Full Glam',
    duration: '75 min',
    priceFrom: 150,
    description: 'Bold, camera-ready, night-out energy.',
    cta: 'Book Full Glam →',
    image: 'look-full-glam',
  },
  {
    id: 'bridal-makeup',
    name: 'Bridal Makeup',
    headline: 'Bridal Makeup',
    duration: '120 min',
    priceFrom: 225,
    description: 'Trial + wedding-day, built to last.',
    cta: 'Book Bridal →',
    image: 'look-bridal-process',
  },
]

// Secondary/add-on services shown as a compact list under the main grid.
export const addOnServices = [
  { id: 'special-event-glam', name: 'Special Event Glam', duration: '60 min', priceFrom: 135 },
  { id: 'bridal-trial', name: 'Bridal Trial', duration: '60 min', priceFrom: 165 },
  { id: '1-on-1-makeup-lesson', name: '1-on-1 Makeup Lesson', duration: '90 min', priceFrom: 175 },
]

export const pricingDisclaimer =
  'Expert artistry. Premium products. Placeholder pricing — to be validated with Emmanuelle.'

// "Selected Looks" filmstrip — real client photography, resized/recompressed
// from design-reference/uploads/ for web use. `image` keys match the
// filenames under src/assets/portfolio/.
export const selectedLooks = [
  { image: 'look-natural-glam', label: 'Natural Glam' },
  { image: 'look-timeless', label: 'Timeless' },
  { image: 'look-full-glam', label: 'Full Glam' },
  { image: 'look-bridal-process', label: 'Bridal · process' },
  { image: 'look-special-event', label: 'Special Event Glam' },
  { image: 'look-creative-glam', label: 'Creative Glam' },
]

export const about = {
  bio: 'With a refined eye and a calm, professional presence, Emmanuelle creates bespoke looks that enhance your natural beauty and last all day (and night).',
  // The design explicitly marks the bio incomplete: "[FINAL BIO TEXT REQUIRED]".
  bioPlaceholder: '[FINAL BIO TEXT REQUIRED]',
  badges: ['Professional', 'Premium Products', 'Personalized', 'On-location'],
}

// The design has no real client testimonial yet — it explicitly marks the
// quote and name as placeholders. Do not invent one; `quote`/`clientName`
// stay null until Emmanuelle provides real client feedback.
export const testimonial = {
  quote: null,
  quotePlaceholder: '[CLIENT TESTIMONIAL REQUIRED — real client feedback will replace this placeholder]',
  clientName: null,
  clientNamePlaceholder: '[Client name]',
}

// Booking policies — the design shows five categories, each explicitly
// "[To be confirmed]". No policy content is invented here.
export const policiesDisclaimer = "[Policy content pending Emmanuelle's confirmation]"
export const policyBodyPlaceholder = '[To be confirmed]'
export const policies = [
  { id: 'deposits-payment', title: 'Deposits & Payment', body: null },
  { id: 'cancellation-rescheduling', title: 'Cancellation & Rescheduling', body: null },
  { id: 'late-arrivals-no-shows', title: 'Late Arrivals & No-Shows', body: null },
  { id: 'appointment-prep', title: 'Appointment Prep', body: null },
  { id: 'travel-location', title: 'Travel / Location', body: null },
]

// ---------------------------------------------------------------------------
// CLIENT_CONFIRMATION_REQUIRED — a proposal, not live data.
//
// Sourced from a secondary, independently-built Makeup-by Emma site
// (emma-mackup.netlify.app), audited 2026-09-10. Nothing here is imported or
// rendered anywhere — it exists so Emmanuelle can review candidate values
// against her real business facts before anything above (`business`,
// `services`, `policies`, `about`) is touched. Do not wire this into a
// component; do not copy a value out of it without her explicit sign-off.
//
// CAUTION: the secondary site has internal inconsistencies that suggest at
// least some of its content is uncustomized template filler rather than this
// client's real data —
//   - phone uses a "555" exchange, the standard fake/placeholder pattern
//   - its mobile-service travel radius is centered on zip 30318 (Atlanta,
//     GA), contradicting its own "Stafford, Virginia / DMV" copy
//   - a bridal contact email (takidamakeup@gmail.com) carries a different
//     business name than the one branding the rest of that site
// Treat every value below as unverified until Emmanuelle confirms it, even
// the ones that look internally consistent (e.g. the deposit/policy fees).
export const CLIENT_CONFIRMATION_REQUIRED = {
  contact: {
    phone: {
      proposed: '+1 (540) 555-0148',
      status: 'REJECTED — do not use',
      reason:
        '"555" exchange is a placeholder-number pattern, not a real assigned line. business.contact.phone is already confirmed by Emmanuelle; keep it.',
    },
    email: {
      proposed: 'makeupbyemma2020@gmail.com',
      secondaryProposed: 'takidamakeup@gmail.com (used only for bridal inquiries on the other site)',
      status: 'REJECTED — do not use',
      reason:
        'Conflicts with the confirmed business.contact.email. The "takidamakeup" address carries an unrelated brand name, likely template leftover.',
    },
    instagram: {
      proposed: '@make_up_byemma',
      status: 'REJECTED — do not use',
      reason: 'Conflicts with the two Instagram handles already confirmed in business.social.instagram.',
    },
  },

  deposit: {
    proposed: {
      type: 'fixed',
      value: 50,
      note:
        'A $50 deposit — strictly non-refundable and non-transferable — is required to secure every booking. Remaining balance due in cash on the day of the appointment; bridal balances due in full 30 days before the wedding date.',
    },
    conflictsWith: 'business.deposit (type/value currently null — unset, not conflicting, but this would set it)',
    confidence: 'Self-consistent across the other site\'s policy and FAQ copy, but still unverified — needs Emmanuelle\'s confirmation before setting business.deposit.',
  },

  // Candidate policy bodies to fill `policies[].body`. No "appointment-prep"
  // content was found on the secondary site, so that category has no
  // proposal and should stay a placeholder until Emmanuelle provides one.
  policies: [
    {
      id: 'deposits-payment',
      proposedBody:
        'A $50 deposit is required for all bookings — strictly non-refundable and non-transferable. The remaining balance is due in cash only, on the day of the appointment. Bridal balances must be paid in full 30 days prior to the wedding date.',
    },
    {
      id: 'cancellation-rescheduling',
      proposedBody: 'Rescheduling is allowed once, up to 24 hours before your appointment.',
    },
    {
      id: 'late-arrivals-no-shows',
      proposedBody:
        'A $25 late fee applies at 15 minutes late, plus $1 per minute thereafter. Appointments are canceled after 30 minutes late.',
    },
    {
      id: 'travel-location',
      proposedBody:
        'On-location travel starts at $25. Out-of-state travel requires full client accommodation coverage. (Note: the source site scoped its mobile-service radius to an Atlanta, GA zip code — almost certainly a template error given its own Stafford/DMV location claims. Do not carry that radius over; confirm the real service radius with Emmanuelle.)',
    },
    {
      id: 'appointment-prep',
      proposedBody: null,
      note: 'No candidate content found on the secondary site for this category.',
    },
  ],
  additionalFeesNotYetInPolicies: [
    'After-hours fee: +$30 for appointments booked before 7:00 AM or after 7:00 PM.',
    'Sunday booking fee: +$30 (source site routes Sunday bookings to email-only booking).',
  ],

  // The secondary site's service menu is a different set of names/prices/
  // durations than `services` above, not a superset — this needs a decision
  // (replace vs. merge vs. ignore), not an import.
  services: {
    proposed: [
      {
        title: 'Basic Glam',
        tag: 'Natural Glam',
        price: 130,
        unit: 'person',
        desc: 'Flawless skin, brows, and lashes — no eyeshadow or contour.',
      },
      {
        title: 'Signature Glam',
        tag: 'Full Glam',
        price: 150,
        unit: 'person',
        desc: 'Full skin prep, soft-to-bold eye makeup, contour, highlight, lashes. Add-ons (glitter, cut crease, gems) extra.',
      },
      {
        title: 'The "On Demand" Glam',
        tag: 'House Calls',
        price: 300,
        unit: 'visit',
        desc:
          'Mobile full glam for one person; +$5/mile beyond the base radius, +$150 per additional person. Not available for bridal/weddings.',
      },
      {
        title: 'Essential Bridal Package',
        tag: 'Bridal',
        price: 600,
        unit: 'bride',
        duration: '1 hour, 30 minutes',
        desc:
          'Full bridal glam with premium products, a bridal trial session, mink lashes, touch-up kit, and long-wear setting spray. Starter package only — all-day/group bridal needs a separate quote.',
      },
    ],
    conflictsWith:
      'business.services (Natural/Soft/Full Glam + Bridal Makeup at $85/$125/$150/$225) — entirely different names and prices, not a simple merge. Needs Emmanuelle to pick one menu or reconcile the two.',
  },

  about: {
    bioDraft:
      "I'm Emma — a makeup artist working across the DMV and beyond. For more than a decade I've stood beside brides on the most significant mornings of their lives, chased golden-hour light with photographers, and helped women walk into a room feeling unmistakably themselves.",
    stats: { yearsOfMastery: 12, facesPainted: 600, weddings: 180, responseTimeHours: 24 },
    status: 'UNVERIFIED — do not use as-is',
    reason:
      'Written in first-person as "Emma" (your site uses third-person "Emmanuelle"), and the experience/wedding-count numbers cannot be confirmed as real. Useful only as a tone/style reference for Emmanuelle\'s own final bio, not as source text.',
  },
}
