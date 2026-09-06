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
  name: 'Emmanuelle Singani',
  tagline: 'Emmanuelle Singani Beauty',
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
    // The design itself marks this "[PHONE TO BE CONFIRMED]" — do not invent a number.
    phone: null,
  },
  social: {
    instagram: ['https://www.instagram.com/emma_sing84', 'https://www.instagram.com/emma_sing2'],
    facebook: 'https://www.facebook.com/profile.php?id=100008196917547',
  },
  // Deposit structure (fixed $ vs %) is explicitly unconfirmed in the design
  // ("[DEPOSIT — fixed $ or % TBC]"). Left null on purpose — the booking
  // flow (Milestone 3+) must not assume a value here.
  deposit: {
    type: null, // 'fixed' | 'percent'
    value: null,
    note: 'Deposit amount/structure pending confirmation with Emmanuelle.',
  },
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
