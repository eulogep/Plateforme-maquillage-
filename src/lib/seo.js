// SEO infrastructure that stays correct with zero production domain yet
// confirmed. Everything here is environment-configurable via VITE_SITE_URL
// (see .env.example) — until it's set, this module deliberately adds
// NOTHING domain-dependent (no canonical link, no og:url, no JSON-LD
// `url`), rather than shipping a guessed or placeholder-looking address
// that would actively mislead search engines. The moment VITE_SITE_URL is
// set in the real deployment's environment, all of it activates with no
// further code change.
//
// JSON-LD is added dynamically (not hardcoded in index.html) so it can be
// built from the same single source of truth as the rest of the site
// (src/config/business.js) — Google's crawler executes JavaScript and
// explicitly supports structured data injected this way.
import { business } from '@/config/business'

const SITE_URL = (import.meta.env.VITE_SITE_URL || '').replace(/\/+$/, '')

function upsertMeta(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * LocalBusiness structured data, built only from facts already confirmed
 * elsewhere in the codebase (src/config/business.js). Deliberately omits:
 *   - priceRange / any pricing claim — service prices are still explicit
 *     placeholders (see pricingDisclaimer), not real business data.
 *   - aggregateRating / review — no real reviews exist; inventing any
 *     would be exactly the kind of fabricated claim this project's
 *     instructions forbid.
 *   - openingHours — never confirmed anywhere in this codebase.
 * Add any of the above only once Emmanuelle confirms the real values.
 */
function buildLocalBusinessSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: `${business.tagline} — makeup artistry in ${business.location.city}, ${business.location.state}, serving ${business.location.areaServed}.`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.location.line1,
      addressLocality: business.location.city,
      addressRegion: business.location.state,
      postalCode: business.location.zip,
      addressCountry: 'US',
    },
    email: business.contact.email,
  }
  const phones = (business.contact.phones ?? [business.contact.phone]).filter(Boolean)
  if (phones.length) {
    schema.telephone = phones
  }
  const sameAs = [...business.social.instagram, business.social.facebook].filter(Boolean)
  if (sameAs.length) {
    schema.sameAs = sameAs
  }
  if (SITE_URL) {
    schema.url = SITE_URL
    schema['@id'] = SITE_URL
  }
  return schema
}

function upsertJsonLd(schema) {
  let el = document.getElementById('ld-local-business')
  if (!el) {
    el = document.createElement('script')
    el.id = 'ld-local-business'
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(schema)
}

/** Call once at app startup (see main.jsx). */
export function initSeo() {
  if (SITE_URL) {
    upsertCanonical(SITE_URL + '/')
    upsertMeta('og:url', SITE_URL + '/')
  }
  upsertJsonLd(buildLocalBusinessSchema())
}
