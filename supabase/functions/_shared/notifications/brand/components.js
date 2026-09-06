// Reusable, email-safe HTML building blocks. Every function returns a
// plain HTML string — no JS, no external CSS, no CSS Grid/Flexbox, no
// unsupported shorthand. Layout is table-based (the only layout technique
// that renders consistently in Outlook desktop, which uses Word's HTML
// engine, not a browser engine) with every visual style applied inline,
// since Outlook and many mobile clients strip <style> blocks or only
// partially honor them. A <style> block is still included once, in the
// shell, purely as progressive enhancement (a couple of small-screen
// tweaks) — nothing it contains is required for the email to look right.
import { brand } from './tokens.js'

const { colors, fonts, logo, social } = brand

function esc(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Hidden preview text shown in the inbox list, before the email is opened. */
export function preheader(text) {
  return `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(
    text
  )}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`
}

/** Dark ink header band with the logo, centered. Alt text covers images-off clients. */
export function header() {
  return `
  <tr>
    <td style="background:${colors.ink};padding:28px 24px;text-align:center;">
      <img src="${logo.url}" width="${logo.width}" alt="${esc(logo.alt)}" style="display:inline-block;width:${
    logo.width
  }px;max-width:${logo.width}px;height:auto;border:0;outline:none;text-decoration:none;" />
      <!--[if !mso]><!-->
      <div style="display:none;"></div>
      <!--<![endif]-->
    </td>
  </tr>`
}

/**
 * Hero/title block. `eyebrow` is the small gold uppercase label (matches
 * the website's section-label pattern), `title` the main line, `italicTail`
 * an optional emphasized closing phrase (Georgia italic, evoking the
 * site's Playfair Display italic accents).
 */
export function hero({ eyebrow, title, italicTail, bg = colors.cream }) {
  return `
  <tr>
    <td style="background:${bg};padding:36px 32px 8px;text-align:center;">
      ${
        eyebrow
          ? `<div style="font-family:${fonts.body};font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${colors.gold};margin:0 0 12px;">${esc(
              eyebrow
            )}</div>`
          : ''
      }
      <div style="font-family:${fonts.heading};font-size:26px;line-height:1.3;color:${colors.inkText};margin:0;">
        ${esc(title)}${italicTail ? ` <em style="color:${colors.magenta};">${esc(italicTail)}</em>` : ''}
      </div>
    </td>
  </tr>`
}

/** Plain body paragraph — the short personalized message under the hero. */
export function paragraph(text, { bg = colors.cream, color = colors.mutedText } = {}) {
  return `
  <tr>
    <td style="background:${bg};padding:12px 32px 4px;font-family:${fonts.body};font-size:14px;line-height:1.7;color:${color};text-align:center;">
      ${esc(text)}
    </td>
  </tr>`
}

function summaryRow(label, value) {
  if (!value) return ''
  return `
    <tr>
      <td style="padding:7px 0;font-family:${fonts.body};font-size:13px;color:${colors.faintText};">${esc(
    label
  )}</td>
      <td style="padding:7px 0;font-family:${fonts.body};font-size:13px;color:${colors.inkText};text-align:right;">${esc(
    value
  )}</td>
    </tr>`
}

/**
 * The appointment-details card: service/date/time/duration/reference, in a
 * bordered cream-soft box matching the website's review-step card styling.
 */
export function bookingSummaryCard({ serviceName, dateLabel, timeLabel, durationLabel, reference }) {
  return `
  <tr>
    <td style="background:${colors.cream};padding:20px 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${
        colors.creamSoft
      };border:1px solid rgba(36,31,27,.08);">
        <tr>
          <td style="padding:18px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${summaryRow('Service', serviceName)}
              ${summaryRow('Date', dateLabel)}
              ${summaryRow('Time', timeLabel)}
              ${summaryRow('Duration', durationLabel)}
              ${summaryRow('Reference', reference)}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
}

/** Payment breakdown card — amount paid/due, remaining balance. */
export function paymentSummaryCard({ amountLabel, amountValue, remainingLabel, remainingValue }) {
  if (!amountValue && !remainingValue) return ''
  return `
  <tr>
    <td style="background:${colors.cream};padding:0 32px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${
        colors.creamSoft
      };border:1px solid rgba(36,31,27,.08);">
        <tr>
          <td style="padding:18px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              ${summaryRow(amountLabel, amountValue)}
              ${summaryRow(remainingLabel, remainingValue)}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
}

/**
 * Bulletproof CTA button — a table cell with a background color, not a
 * styled <a> alone, so it renders correctly in Outlook (which ignores CSS
 * padding/background on inline elements but honors it on table cells).
 * The link text itself remains fully visible/clickable even with images
 * off, since no part of the button is an image.
 */
export function ctaButton({ href, label, primary = true }) {
  const bg = primary ? colors.navy : 'transparent'
  const color = primary ? colors.cream : colors.navy
  const border = primary ? 'none' : `1px solid ${colors.navy}`
  return `
  <tr>
    <td style="background:${colors.cream};padding:4px 32px 28px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
        <tr>
          <td style="background:${bg};border:${border};">
            <a href="${esc(href)}" style="display:inline-block;padding:14px 32px;font-family:${
    fonts.body
  };font-size:13px;letter-spacing:.04em;color:${color};text-decoration:none;">${esc(label)}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
}

/** Optional secondary text link (not a full button) — e.g. "View booking details". */
export function textLink({ href, label }) {
  return `
  <tr>
    <td style="background:${colors.cream};padding:0 32px 28px;text-align:center;">
      <a href="${esc(href)}" style="font-family:${fonts.body};font-size:12px;color:${
    colors.navy
  };text-decoration:underline;">${esc(label)}</a>
    </td>
  </tr>`
}

/** Optional "how to prepare" note — plain text, no invented policy content passed by caller. */
export function preparationNote(text) {
  if (!text) return ''
  return `
  <tr>
    <td style="background:${colors.creamSoft};padding:16px 32px;font-family:${fonts.body};font-size:12.5px;line-height:1.6;color:${colors.mutedText};border-top:1px solid rgba(36,31,27,.08);">
      ${esc(text)}
    </td>
  </tr>`
}

/**
 * Dark ink footer — business name, location, contact (only confirmed
 * fields; contactPhone omitted when null, never invented), Instagram.
 */
export function footer({ businessName, locationLine, contactEmail, contactPhone }) {
  return `
  <tr>
    <td style="background:${colors.ink};padding:28px 32px;text-align:center;">
      <div style="font-family:${fonts.heading};font-style:italic;font-size:15px;color:${
    colors.cream
  };margin:0 0 8px;">${esc(businessName)}</div>
      <div style="font-family:${fonts.body};font-size:11.5px;line-height:1.7;color:#C9BFB4;">
        ${esc(locationLine)}<br/>
        ${contactEmail ? `<a href="mailto:${esc(contactEmail)}" style="color:#C9BFB4;text-decoration:underline;">${esc(contactEmail)}</a>` : ''}${
    contactPhone ? ` &middot; ${esc(contactPhone)}` : ''
  }
      </div>
      <div style="margin-top:14px;">
        <a href="${esc(social.instagramUrl)}" style="font-family:${fonts.body};font-size:11px;letter-spacing:.05em;color:${
    colors.blush
  };text-decoration:underline;">${esc(social.instagramLabel)}</a>
      </div>
      <div style="margin-top:16px;font-family:${fonts.body};font-size:10px;color:#8A7A6C;">
        &copy; ${new Date().getFullYear()} ${esc(businessName)} Beauty. All rights reserved.
      </div>
    </td>
  </tr>`
}

/**
 * Wraps a sequence of <tr> row-strings (from the components above) into a
 * complete, standalone HTML email document. `title` becomes the document
 * <title> (used by some clients/screen readers); `preheaderText` is the
 * inbox-preview snippet.
 */
export function emailShell({ title, preheaderText, rows }) {
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>${esc(title)}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style>
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img{-ms-interpolation-mode:bicubic;}
  body{margin:0;padding:0;width:100%!important;background:${colors.creamSoft};}
  @media screen and (max-width:600px){
    .email-container{width:100%!important;}
    .email-padded{padding-left:20px!important;padding-right:20px!important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${colors.creamSoft};">
${preheaderText ? preheader(preheaderText) : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${
    colors.creamSoft
  };">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:${
        colors.cream
      };">
        ${rows.join('\n')}
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}
