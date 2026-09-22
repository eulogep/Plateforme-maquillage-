// Centralized business content/config for the marketing site.
//
// This is the single source of truth for services, pricing, policies,
// location/contact, and the still-open placeholders — so components stay
// presentational and Emmanuelle's real business facts live in one place
// instead of being scattered across JSX.
//
// Sources of truth: the official brand in design-reference/ and the business
// details confirmed by the client on 2026-09-10 after the secondary-site
// audit. Values that were not present in that source remain explicit
// placeholders rather than being inferred.

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
    areaServed: 'Fredericksburg, the DMV & worldwide',
    // Stafford, VA is unambiguously in the US Eastern time zone — this is a
    // geographic fact, not an unconfirmed business preference, so it's set
    // explicitly here rather than left as a placeholder. All availability
    // computation must use this, never the visitor's browser time zone.
    timezone: 'America/New_York',
  },
  contact: {
    email: 'makeupbyemma2020@gmail.com',
    bridalEmail: 'takidamakeup@gmail.com',
    // Both numbers were explicitly retained by the client on 2026-09-10.
    // `phone` remains the primary notification number for backwards
    // compatibility; public contact surfaces render the full list.
    phone: '+15712669829',
    phones: ['+15712669829', '+15405550148'],
    responseTime: 'Within 24 hours',
  },
  social: {
    instagram: [
      'https://www.instagram.com/make_up_byemma',
      'https://www.instagram.com/emma_sing84',
      'https://www.instagram.com/emma_sing2',
    ],
    facebook: 'https://www.facebook.com/profile.php?id=100008196917547',
    whatsapp: 'https://wa.me/15405550148',
  },
  // Display-only mirror. Stripe still computes the authoritative amount in
  // supabase/functions/_shared/depositConfig.js.
  deposit: {
    type: 'fixed',
    value: 50,
    currency: 'USD',
    refundable: false,
    transferable: false,
    note: 'A $50 non-refundable, non-transferable deposit secures every booking.',
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

// Primary services shown as image-led cards. `priceConfirmed` distinguishes
// accepted prices from retained legacy offers that still need a final value.
export const services = [
  {
    id: 'natural-glam',
    name: 'Basic Glam',
    headline: 'Basic Glam',
    duration: '45 min',
    priceFrom: 130,
    priceConfirmed: true,
    durationConfirmed: false,
    description: 'Flawless skin, brows, and lashes — without eyeshadow or contour.',
    cta: 'Book Basic Glam →',
    image: 'look-natural-glam',
    includes: ['Flawless, radiant skin', 'Brow shaping and definition', 'Lashes included'],
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
    priceConfirmed: false,
    durationConfirmed: false,
    description: 'Natural, luminous, everyday-elegant.',
    cta: 'Book Soft Glam →',
    image: 'look-timeless',
  },
  {
    id: 'full-glam',
    name: 'Signature Glam',
    headline: 'Signature Glam',
    duration: '75 min',
    priceFrom: 150,
    priceConfirmed: true,
    durationConfirmed: false,
    description: 'Camera-ready glam with skin prep, eye makeup, contour, highlight, and lashes.',
    cta: 'Book Signature Glam →',
    image: 'look-full-glam',
    includes: ['Full skin prep', 'Soft-to-bold eye makeup', 'Contour and highlight', 'Lashes included'],
    note: 'Glitter, cut crease, and gems are available for an additional fee.',
  },
  {
    id: 'bridal-makeup',
    name: 'Essential Bridal Package',
    headline: 'Essential Bridal Package',
    duration: '90 min',
    priceFrom: 600,
    priceConfirmed: true,
    durationConfirmed: true,
    description: 'Luxury, long-wear bridal glam with a pre-wedding session and touch-up kit.',
    cta: 'Book Essential Bridal →',
    image: 'look-bridal-process',
    includes: ['Customized skin prep', 'Soft-to-full bridal glam', 'Premium mink lashes', 'LUX touch-up kit'],
    note: 'For all-day and group bridal packages, email takidamakeup@gmail.com.',
  },
]

// Secondary/add-on services shown as a compact list under the main grid.
export const addOnServices = [
  {
    id: 'on-demand-glam',
    name: 'The “On Demand” Glam',
    duration: null,
    priceFrom: 300,
    priceConfirmed: true,
    durationConfirmed: false,
    bookable: false,
    note: 'Includes one person and travel within 15 miles of 30318. Additional mileage is $5 per mile; each additional person is $150. Not available for bridal bookings.',
  },
  { id: 'special-event-glam', name: 'Special Event Glam', duration: '60 min', priceFrom: 135, priceConfirmed: false, durationConfirmed: false },
  { id: 'bridal-trial', name: 'Bridal Trial', duration: '60 min', priceFrom: 165, priceConfirmed: false, durationConfirmed: false },
  { id: '1-on-1-makeup-lesson', name: '1-on-1 Makeup Lesson', duration: '90 min', priceFrom: 175, priceConfirmed: false, durationConfirmed: false },
]

export const pricingDisclaimer =
  'Starting prices are shown. Soft Glam and legacy add-on pricing and unlabelled durations still require confirmation.'

// "Selected Looks" filmstrip — real client photography, resized/recompressed
// from design-reference/uploads/ for web use. `image` keys match the
// filenames under src/assets/portfolio/.
export const selectedLooks = [
  { image: 'look-natural-glam', label: 'Basic Glam' },
  { image: 'look-timeless', label: 'Timeless' },
  { image: 'look-full-glam', label: 'Signature Glam' },
  { image: 'look-bridal-process', label: 'Bridal · process' },
  { image: 'look-special-event', label: 'Special Event Glam' },
  { image: 'look-creative-glam', label: 'Creative Glam' },
  { image: 'look-reference-gems', label: 'Gems & Cut Crease' },
  { image: 'look-reference-editorial', label: 'Editorial Portrait' },
  { image: 'look-reference-evening', label: 'Evening Glow' },
  { image: 'look-reference-natural', label: 'Natural Radiance' },
  { image: 'look-reference-color', label: 'Graphic Color Pop' },
]

export const about = {
  bio: "I'm Emma — a makeup artist working across the DMV and beyond. For more than a decade, I have helped brides, private clients, and creative teams feel unmistakably themselves. I listen to your vision, study your features and undertones, and create a look made for you. My professional kit includes Danessa Myricks, Pat McGrath, MAC Pro, and Charlotte Tilbury, with airbrush available when the look calls for it.",
  bioPlaceholder: null,
  badges: ['Established 2013', 'Licensed & Insured', 'Sanitary Application', 'On-location'],
  philosophy: 'Makeup should enhance, never mask.',
  stats: [
    { value: '12+', label: 'Years of mastery' },
    { value: '600+', label: 'Faces painted' },
    { value: '180+', label: 'Weddings' },
  ],
}

// Testimonials confirmed by the client after the secondary-site audit.
export const testimonials = [
  {
    quote: 'Emma understood exactly what I wanted — even before I could put it into words. On my wedding day I looked like myself, but elevated. Everyone kept asking who did my makeup.',
    clientName: 'Ashley M. · Bride · Fredericksburg, VA',
  },
  {
    quote: 'Emma reads the creative direction instantly. She is precise, fast, and the looks translate beautifully on camera.',
    clientName: 'Marcus D. · Creative Director · Washington, D.C.',
  },
  {
    quote: 'I booked Emma for a gala and received compliments all evening. The makeup lasted eight hours without a touch-up.',
    clientName: 'Nia R. · Private Client · Alexandria, VA',
  },
]

// Booking policies accepted by the client after the secondary-site audit.
export const policiesDisclaimer = 'Please review these terms before booking. A $50 deposit is required to secure your appointment.'
export const policyBodyPlaceholder = '[To be confirmed]'
export const policies = [
  {
    id: 'deposits-payment',
    title: 'Deposits & Payment',
    body: 'A $50 deposit is required for every booking and is non-refundable and non-transferable. The remaining balance is due in cash on the appointment day. Bridal balances are due in full 30 days before the wedding.',
  },
  {
    id: 'cancellation-rescheduling',
    title: 'Cancellation & Rescheduling',
    body: 'You may reschedule once when you provide at least 24 hours’ notice. The booking deposit is non-refundable and non-transferable.',
  },
  {
    id: 'late-arrivals-no-shows',
    title: 'Late Arrivals & No-Shows',
    body: 'A $25 fee applies after 15 minutes, plus $1 for each additional minute. Appointments are cancelled after 30 minutes late.',
  },
  {
    id: 'appointment-prep',
    title: 'Appointment Prep',
    body: 'Check the address, service, date, and time in your confirmation email. Contact Emmanuelle before your appointment if any detail is incorrect.',
  },
  {
    id: 'travel-location',
    title: 'Travel / Location',
    body: 'On-location travel starts at $25. The On Demand Glam includes travel within 15 miles of ZIP code 30318; extra mileage is $5 per mile. Out-of-state travel requires the client to cover accommodation. Sunday and before-7 AM or after-7 PM appointments carry a $30 fee and must be requested directly by email.',
  },
]

export const faqs = [
  {
    question: 'Do you travel to my location?',
    answer: 'Yes. The On Demand Glam brings a full glam experience to you. The $300 starting price includes one person and travel within 15 miles of ZIP code 30318. Additional mileage is $5 per mile, and each additional person is $150. This service is not available for bridal or wedding inquiries.',
  },
  {
    question: 'How far in advance should I book?',
    answer: 'For weddings, booking 6–12 months ahead is ideal, especially during the May–October peak season. For events and photoshoots, allow 2–4 weeks when possible. Last-minute openings may still be available.',
  },
  {
    question: 'Do you offer bridal trials?',
    answer: 'Yes. The Essential Bridal Package includes a full glam session before the wedding day to finalize your look, comfort, and preferences.',
  },
  {
    question: 'What products do you use?',
    answer: 'Emma uses a curated professional kit selected for longevity and camera performance, including Danessa Myricks, Pat McGrath, Charlotte Tilbury, and MAC Pro, with airbrush when appropriate.',
  },
  {
    question: 'How do I secure my date?',
    answer: 'A $50 non-refundable and non-transferable deposit secures your date. Ordinary balances are due in cash on the appointment day; bridal balances are due in full 30 days before the wedding.',
  },
  {
    question: 'What if I need to reschedule or run late?',
    answer: 'You may reschedule once with at least 24 hours’ notice. A $25 fee applies after 15 minutes, plus $1 for each additional minute. Appointments are cancelled after 30 minutes late.',
  },
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
  status: 'ARCHIVED — historical proposal, superseded by confirmed integration',
  supersededBy: 'docs/audits/2026-09-10-secondary-site/CONFIRMED_INTEGRATION.json',
  note: 'The entries below preserve the original audit assessment, not current business decisions. Use the live exports above and the confirmed integration record for current values and remaining questions.',
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
