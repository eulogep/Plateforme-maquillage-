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

Taken from the official **Makeup-by Emma** brand board (black + champagne /
metallic gold, with the circular "ME" brush emblem):

| Board name | Value | Used for |
|---|---|---|
| Noir Profond | `#14110D` | Header/footer bands, CTA button ground |
| Champagne Gold | `#D9B872` | Text/accents **on the dark bands only** |
| Doré Métallique | `#B8863E` | Hairline rules, card borders |
| Rose Poudré | `#E8C9C4` | Social link on the dark footer |
| Beige Nude | `#D8BFA0` | Reserved |
| Ivoire | `#FBF3E7` | Email body surface |
| Taupe | `#AFA08D` | Reserved |
| Cuivre | `#A5643D` | Large italic emphasis on ivory |
| Cuivre (dark step) | `#8B5130` | Small uppercase labels on ivory |

The board names its palette but doesn't print hex codes, so these are
matched by eye from its swatches — **replace them with official values if
they exist**; nothing else needs to change.

### The gold-contrast rule

Gold is a light color: Champagne Gold on ivory measures ~1.7:1 and Doré
Métallique ~2.9:1 — both illegible as text, well under the 4.5:1 AA
threshold. So gold is used as *text* only on the Noir Profond bands (~10:1
there), and small gold-family text on ivory uses the Cuivre steps
(~5.6:1) instead. Gold still appears on ivory as hairline rules and card
borders, where contrast ratios don't apply because it carries no text.
That's also how the brand board itself always presents gold — on black.
`components.test.js` enforces this rule so it can't regress.

**Fonts**: the board's script face ("Script Élégante") is never used as
live email text — it reaches the reader as pixels inside the logo image,
which is immune to font loading. Live text uses `Georgia, 'Times New
Roman', Times, serif` (closest safe stand-in for the board's "Serif Luxe")
and `Arial, Helvetica, sans-serif` ("Sans-serif Moderne"). Real email
clients cannot load Google Fonts — Outlook desktop never honors
`@font-face`, and Gmail strips `<link>` tags — so no text ever depends on a
web font arriving.

### Logo assets

Both are uploaded to the public `email-assets` bucket:

- `logo-gold-emblem.png` — the circular "ME" emblem. Transparent outside
  its black disc, which is exactly why it sits cleanly on the Noir Profond
  header band. Used in the header at 104px.
- `logo-gold-lockup.png` — the full horizontal lockup (emblem + script
  wordmark + "MAKEUP ARTIST"), available for wider layouts; not currently
  used by any template.

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
- **Accessibility**: real measured contrast throughout — dark ink on ivory
  and gold/warm-grey on Noir Profond, all above WCAG AA for their text
  size, with the gold rule above keeping the light gold off light grounds
  as text; no
  information conveyed by color alone, descriptive link text ("View
  booking details", not "click here"), alt text on the only image.

## What's NOT done yet (by design, per instructions)

- `send.js` still sends the plain (unbranded) templates — swapping to
  these branded ones is a deliberate, separate step pending your visual
  approval.
- No actual test send through Resend using these templates.
- No cancellation/reschedule template (no such flow exists in the app).
