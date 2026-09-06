// Brand tokens for transactional email — the exact hex values already
// established on the website (src/App.css's brand-* tokens /
// design-reference's frozen Homepage.dc.html), duplicated here for the
// same cross-runtime reason as everywhere else in supabase/functions.
//
// Email clients cannot load Google Fonts reliably (Outlook desktop never
// honors @font-face/web fonts at all; Gmail strips <link> tags). Every
// font-family below leads with the real brand font for the handful of
// clients that DO honor it (Apple Mail, some webmail), immediately
// followed by solid, widely-available fallbacks chosen to evoke the same
// feeling: Georgia (a serif with real italic support, close in spirit to
// Playfair Display) for headings, Arial/Helvetica for body text — never a
// web-font-only stack.
export const brand = {
  colors: {
    ink: '#14110D',
    cream: '#F7F1E9',
    creamSoft: '#FBF7F1',
    navy: '#1F2B47',
    blush: '#D9A0BE',
    magenta: '#9B2F6B',
    gold: '#B08D57',
    inkText: '#241F1B',
    mutedText: '#5C4F44',
    faintText: '#8A7A6C',
  },
  fonts: {
    heading: "Georgia, 'Times New Roman', Times, serif",
    body: "Arial, Helvetica, sans-serif",
  },
  logo: {
    // Uploaded to a public Storage bucket specifically for email use (see
    // supabase/migrations/20260907400001_email_assets_bucket.sql) —
    // transactional emails need a real, stable HTTPS URL; there's no
    // "authenticated" way to serve an <img> in an email client.
    url: 'https://wfbetbaojjlsrwsylcuc.supabase.co/storage/v1/object/public/email-assets/logo-dark.png',
    alt: 'Make Up By Emma — Emmanuelle Singani',
    width: 96,
  },
  social: {
    instagramUrl: 'https://www.instagram.com/emma_sing84',
    instagramLabel: 'Follow on Instagram',
  },
}
