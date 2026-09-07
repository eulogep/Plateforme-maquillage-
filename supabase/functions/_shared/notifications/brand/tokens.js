// Brand tokens for transactional email, from the official Makeup-by Emma
// brand board (the black + champagne/metallic gold identity with the
// circular "ME" brush emblem), duplicated here for the same cross-runtime
// reason as everywhere else in supabase/functions.
//
// NOTE ON THE HEX VALUES: the brand board names its palette (Noir Profond,
// Champagne Gold, Doré Métallique, Rose Poudré, Beige Nude, Ivoire, Taupe,
// Cuivre) but doesn't print hex codes, so the values below are matched by
// eye from the board's swatches. They're close, not certified — if there
// are official hex codes, replace these and nothing else needs to change.
//
// Email clients cannot load Google Fonts reliably (Outlook desktop never
// honors @font-face/web fonts at all; Gmail strips <link> tags), so the
// brand's script face ("Script Élégante") is NEVER used as live email
// text — it reaches the reader as pixels, inside the logo image, which is
// immune to font loading. Live text uses Georgia (closest safe stand-in
// for the board's "Serif Luxe") and Arial ("Sans-serif Moderne").
export const brand = {
  colors: {
    // --- Brand board palette, by its own names ---
    noirProfond: '#14110D',
    champagneGold: '#D9B872',
    doreMetallique: '#B8863E',
    rosePoudre: '#E8C9C4',
    beigeNude: '#D8BFA0',
    ivoire: '#FBF3E7',
    taupe: '#AFA08D',
    cuivre: '#A5643D',
    // A darker step of Cuivre, used ONLY where small text sits on the
    // ivory surface: gold-family colors physically can't reach 4.5:1 on
    // ivory while still reading as gold (Champagne Gold manages ~1.7:1,
    // Doré Métallique ~2.9:1), so small labels use this instead. Gold
    // itself is reserved for text on the Noir Profond bands, where it hits
    // ~10:1 — which is also how the brand board itself always shows gold.
    cuivreDeep: '#8B5130',

    // --- Semantic roles used by components.js ---
    ink: '#14110D', // Noir Profond — header/footer bands
    cream: '#FBF3E7', // Ivoire — email body surface
    creamSoft: '#F5EAD9', // warm ivory tint — nested cards
    gold: '#D9B872', // Champagne Gold — on-dark text/accents only
    goldDeep: '#B8863E', // Doré Métallique — hairline rules, borders
    accentSoft: '#E8C9C4', // Rose Poudré — social link on dark
    copper: '#A5643D', // Cuivre — large italic emphasis on ivory
    copperDeep: '#8B5130', // Cuivre (dark step) — small labels on ivory
    inkText: '#241F1B',
    mutedText: '#5C4F44',
    faintText: '#8A7A6C',
    onDarkText: '#D8CFC6',
  },
  fonts: {
    heading: "Georgia, 'Times New Roman', Times, serif",
    body: 'Arial, Helvetica, sans-serif',
  },
  logo: {
    // The official circular "ME" emblem (gold monogram + brush on a black
    // disc, transparent outside the disc — which is exactly why it sits
    // cleanly on the Noir Profond header band). Uploaded to a public
    // Storage bucket for email use (see
    // supabase/migrations/20260907400001_email_assets_bucket.sql):
    // transactional email needs a real, stable HTTPS URL — there's no
    // "authenticated" way to serve an <img> to an email client.
    url: 'https://wfbetbaojjlsrwsylcuc.supabase.co/storage/v1/object/public/email-assets/logo-gold-emblem.png',
    alt: 'Makeup-by Emma — Makeup Artist',
    width: 104,
    // The full horizontal lockup (emblem + script wordmark + "MAKEUP
    // ARTIST") is uploaded alongside it and available for wider layouts:
    // .../email-assets/logo-gold-lockup.png
    lockupUrl: 'https://wfbetbaojjlsrwsylcuc.supabase.co/storage/v1/object/public/email-assets/logo-gold-lockup.png',
  },
  social: {
    instagramUrl: 'https://www.instagram.com/emma_sing84',
    instagramLabel: 'Follow on Instagram',
  },
}
