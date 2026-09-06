# Branded email design system

**Status: preview only.** Nothing in this directory is wired into live
sending — `send.js` (the module actually used by `create-payment-intent`
and `stripe-webhook`) still imports the plain templates in `../content.js`.
Swapping that import is a small, isolated follow-up once these are visually
approved.

## Preview it yourself

```bash
pnpm email:preview
```

Renders all four templates with realistic sample data to
`.preview/*.html` (gitignored, regenerate anytime) — open any file directly
in a browser. A polished side-by-side preview (desktop + mobile toggle, all
four templates, compatibility notes) is also published as a Claude
Artifact — see the milestone report for the link.

## Design tokens (`tokens.js`)

| Role | Value |
|---|---|
| Ink (header/footer bands) | `#14110D` |
| Cream (page/card background) | `#F7F1E9` |
| Cream soft (nested card background) | `#FBF7F1` |
| Navy (primary button, links) | `#1F2B47` |
| Magenta (italic emphasis) | `#9B2F6B` |
| Blush (Instagram link) | `#D9A0BE` |
| Gold (eyebrow labels) | `#B08D57` |

Exactly the site's own brand tokens (`src/App.css`) — the emails are
designed to read as an extension of emmanuellesingani.com, not a generic
transactional-email template.

**Fonts**: `Georgia, 'Times New Roman', Times, serif` for headings (the
closest reliable serif to the site's Playfair Display — real email clients
cannot load Google Fonts: Outlook desktop never honors `@font-face` at all,
and Gmail strips `<link>` tags), `Arial, Helvetica, sans-serif` for body
text. No text ever depends on a web font actually loading.

## Reusable components (`components.js`)

| Component | Purpose |
|---|---|
| `emailShell` | Full HTML document wrapper — table-based, Outlook MSO conditional comments, one small `<style>` block as progressive enhancement only |
| `preheader` | Hidden inbox-preview text |
| `header` | Dark ink band with the logo (real alt text, fixed width) |
| `hero` | Eyebrow label + serif title, optional italic emphasis |
| `paragraph` | Personalized message text |
| `bookingSummaryCard` | Service/date/time/duration/reference — omits any row whose value isn't supplied |
| `paymentSummaryCard` | Amount/remaining-balance rows — renders nothing at all if no amounts are given |
| `ctaButton` | Bulletproof button: a background-colored `<table>` cell around a real `<a>`, never an image, so it stays clickable and legible with images off |
| `textLink` | Secondary plain-text link (e.g. "View booking details") |
| `preparationNote` | Optional prep-instructions section — renders nothing unless the caller supplies real text (never invents one) |
| `footer` | Dark ink footer: business name, address, email, Instagram; phone omitted entirely when not confirmed |

Every component escapes its inputs (`&`, `<`, `>`) and every optional field
is simply omitted from the output when absent — no template ever renders
`"null"`, an empty broken link, or invented policy/contact content.

## Templates (`templates.js`)

1. **`booking_payment_pending`** — "Your appointment is *being held for
   you*." Explicitly states it isn't confirmed yet.
2. **`booking_confirmed`** — "Your appointment is *confirmed!*" Celebratory
   but restrained (no confetti/emoji), shows amount paid + remaining
   balance, Add to Calendar + View booking details CTAs.
3. **`payment_failed`** — "Let's get that *sorted out*." Reassuring, never
   uses alarming language ("failed", "error", "declined" don't appear in
   the customer-facing copy), states plainly that no charge was made.
4. **`appointment_reminder`** — "See you *soon!*" Includes the optional
   preparation section only when the caller provides real text.

A fifth type (cancellation/reschedule) is intentionally **not** built —
no cancellation/reschedule flow exists in the app yet, and the components
above are generic enough that assembling that template later needs no
structural change here, just a new template function.

## Client compatibility notes

- **Layout**: 100% table-based (`<table role="presentation">`), zero CSS
  grid/flexbox — the only layout technique Outlook desktop's Word-based
  rendering engine handles consistently.
- **Styling**: every visual style is inline, on every element. The single
  `<style>` block in the shell only adds a mobile padding tweak and MSO
  text-size-adjust resets — the email looks correct even if a client
  strips `<style>` entirely (Gmail does, for some contexts).
- **Images**: the logo has real `alt` text and explicit `width`; the page
  reads fine and every button/link stays usable with images blocked
  (no button is an image).
- **Buttons**: bulletproof technique (table-cell background, not CSS
  padding on an `<a>`), renders correctly in Outlook.
- **Dark mode**: not specially handled — colors are set explicitly on every
  element (no reliance on client default text/background), which is the
  safest baseline against most clients' automatic dark-mode color
  inversion.
- **Accessibility**: real semantic contrast (dark ink-on-cream and
  cream-on-ink throughout, well above WCAG AA for this text size), no
  information conveyed by color alone, descriptive link text ("View
  booking details", not "click here"), alt text on the only image.

## What's NOT done yet (by design, per instructions)

- `send.js` still sends the plain (unbranded) templates — swapping to
  these branded ones is a deliberate, separate step pending your visual
  approval.
- No actual test send through Resend using these templates.
- No cancellation/reschedule template (no such flow exists in the app).
