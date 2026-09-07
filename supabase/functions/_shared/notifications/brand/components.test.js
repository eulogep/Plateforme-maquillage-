import { describe, it, expect } from 'vitest'
import {
  header,
  hero,
  ctaButton,
  bookingSummaryCard,
  paymentSummaryCard,
  footer,
  preparationNote,
  emailShell,
  preheader,
} from './components.js'
import { brand } from './tokens.js'

describe('header', () => {
  it('includes the logo image with real alt text and no reliance on the image loading', () => {
    const html = header()
    expect(html).toContain(`src="${brand.logo.url}"`)
    expect(html).toContain(`alt="${brand.logo.alt}"`)
    expect(html).toContain('width=')
  })
})

describe('brand contrast rule', () => {
  // Champagne Gold on ivory is ~1.7:1 and Doré Métallique ~2.9:1 — neither
  // is legible as text on the light surface, so gold-as-text is confined
  // to the Noir Profond bands (~10:1) and ivory uses the Cuivre steps.
  // These tests exist so that rule can't be quietly undone.
  it('never uses Champagne Gold as text directly on the ivory surface', () => {
    // Components whose text sits straight on ivory. The CTA button is
    // deliberately excluded: it lays down its own Noir Profond ground, so
    // gold type there is correct (covered by its own test below).
    const ivorySurfaces = [
      hero({ eyebrow: 'Confirmed', title: 'Your appointment is', italicTail: 'confirmed!' }),
      bookingSummaryCard({ serviceName: 'Soft Glam', dateLabel: 'Aug 13, 2030' }),
    ].join('')
    expect(ivorySurfaces).not.toContain(`color:${brand.colors.gold}`)
    expect(ivorySurfaces).not.toContain(`color:${brand.colors.goldDeep}`)
  })

  it('uses the darker Cuivre step for the small uppercase eyebrow', () => {
    const html = hero({ eyebrow: 'Confirmed', title: 'T' })
    expect(html).toContain(`color:${brand.colors.copperDeep}`)
  })

  it('puts Champagne Gold type on a Noir Profond ground in the CTA', () => {
    const html = ctaButton({ href: 'https://example.com', label: 'Go' })
    expect(html).toContain(`background:${brand.colors.ink}`)
    expect(html).toContain(`color:${brand.colors.gold}`)
  })

  it('uses Rose Poudré for the social link on the dark footer', () => {
    const html = footer({ businessName: 'X', locationLine: 'Y', contactEmail: 'e@x.com' })
    expect(html).toContain(`color:${brand.colors.accentSoft}`)
  })
})

describe('ctaButton', () => {
  it('renders a real, always-clickable <a> — not an image-only button', () => {
    const html = ctaButton({ href: 'https://example.com/pay', label: 'Complete Payment' })
    expect(html).toContain('<a href="https://example.com/pay"')
    expect(html).toContain('Complete Payment')
    expect(html).not.toContain('<img')
  })

  it('uses a table cell for the background (Outlook-safe), not CSS on the link', () => {
    const html = ctaButton({ href: 'https://example.com', label: 'Go' })
    expect(html).toMatch(/<table[^>]*role="presentation"/)
  })

  it('escapes the href and label', () => {
    const html = ctaButton({ href: 'https://example.com?a=1&b=2', label: 'A & B' })
    expect(html).toContain('A &amp; B')
    expect(html).toContain('a=1&amp;b=2')
  })
})

describe('bookingSummaryCard', () => {
  it('includes only the rows for provided fields', () => {
    const html = bookingSummaryCard({ serviceName: 'Soft Glam', dateLabel: 'Aug 13, 2030', timeLabel: '1:30 PM' })
    expect(html).toContain('Soft Glam')
    expect(html).toContain('Aug 13, 2030')
    expect(html).toContain('1:30 PM')
    expect(html).not.toContain('Duration')
    expect(html).not.toContain('Reference')
  })
})

describe('paymentSummaryCard', () => {
  it('renders nothing when no amounts are provided', () => {
    expect(paymentSummaryCard({})).toBe('')
  })

  it('renders provided amounts only', () => {
    const html = paymentSummaryCard({ amountLabel: 'Amount paid', amountValue: '$37.50' })
    expect(html).toContain('Amount paid')
    expect(html).toContain('$37.50')
  })
})

describe('preparationNote', () => {
  it('renders nothing when no note is given (never invents prep content)', () => {
    expect(preparationNote(undefined)).toBe('')
    expect(preparationNote(null)).toBe('')
  })

  it('renders the given note verbatim (escaped)', () => {
    expect(preparationNote('Arrive with clean skin.')).toContain('Arrive with clean skin.')
  })
})

describe('footer', () => {
  it('omits the phone entirely when not provided (never invents one)', () => {
    const html = footer({ businessName: 'Emmanuelle Singani', locationLine: 'Stafford, VA', contactEmail: 'e@x.com', contactPhone: null })
    expect(html).not.toContain('null')
    expect(html).not.toMatch(/&middot;\s*$/)
  })

  it('includes the phone when provided', () => {
    const html = footer({ businessName: 'X', locationLine: 'Y', contactEmail: 'e@x.com', contactPhone: '555-123-4567' })
    expect(html).toContain('555-123-4567')
  })

  it('includes the Instagram link', () => {
    const html = footer({ businessName: 'X', locationLine: 'Y', contactEmail: 'e@x.com' })
    expect(html).toContain(brand.social.instagramUrl)
  })
})

describe('preheader', () => {
  it('is visually hidden but present in the markup for inbox preview text', () => {
    const html = preheader('Your booking is confirmed')
    expect(html).toContain('display:none')
    expect(html).toContain('Your booking is confirmed')
  })
})

describe('emailShell', () => {
  it('produces a complete, valid-looking HTML document with no <script> tags', () => {
    const html = emailShell({ title: 'Test', preheaderText: 'preview', rows: ['<tr><td>x</td></tr>'] })
    expect(html).toMatch(/^<!doctype html>/i)
    expect(html).toContain('<title>Test</title>')
    expect(html).not.toContain('<script')
  })

  it('sets a real viewport meta tag for mobile clients', () => {
    const html = emailShell({ title: 'T', preheaderText: 'p', rows: [] })
    expect(html).toContain('name="viewport"')
  })

  it('uses table-based layout, not CSS grid/flexbox', () => {
    const html = emailShell({ title: 'T', preheaderText: 'p', rows: [] })
    expect(html).toContain('<table')
    expect(html).not.toContain('display:flex')
    expect(html).not.toContain('display:grid')
  })
})
