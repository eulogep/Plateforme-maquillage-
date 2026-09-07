// Brand tokens for transactional email, from the official Makeup-by Emma
// brand board (the black + champagne/metallic gold identity with the
// circular "ME" brush emblem), duplicated here for the same cross-runtime
// reason as everywhere else in supabase/functions.
//
// NOTE ON THE HEX VALUES: the black and the gold ramp are SAMPLED from the
// official emblem artwork (decoded pixel values) — the disc is #0B0B0A and
// the gold runs #FCE6B0 -> #E1B472 -> #C29050 -> #996630. The remaining
// swatches (Rose Poudré, Beige Nude, Ivoire, Taupe, Cuivre) are matched by
// eye, because the board names its palette but prints no hex codes. If
// official values exist, replace them here and nothing else changes.
//
// These mirror :root in src/App.css. They are duplicated rather than
// imported for the same cross-runtime reason as everything else under
// supabase/functions — keep the two in sync by hand.
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
    noirProfond: '#0B0B0A',
    champagneGold: '#E1B472',
    doreMetallique: '#C29050',
    rosePoudre: '#EBD3CF',
    beigeNude: '#DCC3A6',
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
    ink: '#0B0B0A', // Noir Profond — header/footer bands
    cream: '#FBF3E7', // Ivoire — email body surface
    creamSoft: '#F5EAD9', // warm ivory tint — nested cards
    gold: '#E1B472', // Champagne Gold — on-dark text/accents only
    goldDeep: '#C29050', // Doré Métallique — hairline rules, borders
    accentSoft: '#EBD3CF', // Rose Poudré — social link on dark
    copper: '#A5643D', // Cuivre — large italic emphasis on ivory
    copperDeep: '#8B5130', // Cuivre (dark step) — small labels on ivory
    inkText: '#241F1B',
    mutedText: '#5C4F44',
    // Darkened from #8A7A6C, which measured only ~3.4:1 on ivory and so
    // failed AA at the 10-12px sizes it is used at.
    faintText: '#6E5F52',
    onDarkText: '#D8CFC6',
  },
  fonts: {
    heading: "Georgia, 'Times New Roman', Times, serif",
    body: 'Arial, Helvetica, sans-serif',
  },
  logo: {
    // The full horizontal lockup — emblem + script wordmark + "MAKEUP
    // ARTIST" — is the email header mark, matching the site header.
    //
    // IMPORTANT: this is the on-dark variant. The client's supplied lockup
    // sets "Makeup-by" and the subtitle in solid black, so on the Noir
    // Profond header band half the wordmark would vanish; those glyphs are
    // recolored to ivory here, exactly as the brand board's own
    // dark-background lockup shows them.
    //
    // Both assets live in a public Storage bucket (see
    // supabase/migrations/20260907400001_email_assets_bucket.sql):
    // transactional email needs a real, stable HTTPS URL — there is no
    // "authenticated" way to serve an <img> to a mail client.
    url: 'https://wfbetbaojjlsrwsylcuc.supabase.co/storage/v1/object/public/email-assets/logo-gold-lockup.png',
    alt: 'Makeup-by Emma — Makeup Artist',
    width: 230,
    // The standalone circular "ME" emblem, for compact/secondary marks.
    emblemUrl:
      'https://wfbetbaojjlsrwsylcuc.supabase.co/storage/v1/object/public/email-assets/logo-gold-emblem.png',
    emblemAlt: 'Makeup-by Emma',
  },
  social: {
    instagramUrl: 'https://www.instagram.com/emma_sing84',
    instagramLabel: 'Follow on Instagram',
  },
}
