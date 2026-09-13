/**
 * Official Makeup-by Emma logo assets.
 *
 * Two lockup variants exist because the client's supplied artwork sets the
 * "Makeup-by" script and the "MAKEUP ARTIST" subtitle in solid black — it
 * is a light-background asset, and on the brand's deep-black surfaces half
 * the wordmark would disappear. `logoLockupOnDark` is that same artwork
 * with only those black glyphs recolored to ivory, matching the
 * dark-background lockup the brand board itself shows. Nothing else was
 * altered: wording, letterforms, spacing and every gold pixel are the
 * client's originals.
 *
 * All three are raster PNGs from the client. Vectorizing them (SVG) would
 * sharpen edges and drop payload weight — logged as a future asset-quality
 * improvement, not done here.
 */
import logoLockupOnDark from './logo-lockup-on-dark.png'
import logoLockupOnLight from './logo-lockup-on-light.png'
import logoEmblem from './logo-emblem.png'

export { logoLockupOnDark, logoLockupOnLight, logoEmblem }

/** Alt text for the full lockup. Carries the brand when images are blocked. */
export const LOCKUP_ALT = 'Makeup-by Emma — Makeup Artist'

/** Alt text for the standalone ME emblem. */
export const EMBLEM_ALT = 'Makeup-by Emma'

/** Intrinsic aspect ratio of the lockup, for reserving layout space. */
export const LOCKUP_RATIO = 2172 / 724
