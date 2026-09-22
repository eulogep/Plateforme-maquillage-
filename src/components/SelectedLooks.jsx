import { motion, useReducedMotion } from 'framer-motion'
import { Expand } from 'lucide-react'
import { portfolioImages } from '@/assets/portfolio'
import { selectedLooks } from '@/config/business'
import { Lightbox, useLightbox } from '@/components/Lightbox'

// See CustomCursor.jsx for why these are destructured rather than used as
// `<motion.div>` / `<motion.figure>` member expressions directly.
const MotionDiv = motion.div
const MotionFigure = motion.figure

// "Selected Looks" gallery. Desktop: a grid accommodating the expanded
// collection without squeezing the portraits. Mobile: a horizontal-scroll strip of
// fixed-width cards, matching the design's mobile homepage screen.
//
// The photography carries this section, so it is presented unfiltered — the
// earlier saturate/contrast tweaks are removed rather than restyled.
//
// On top of that: tiles fade/rise into place as the row scrolls into view
// (once, and skipped entirely under prefers-reduced-motion), and every tile
// opens a full-size lightbox on click/Enter (see Lightbox.jsx) — the same
// interaction on mobile and desktop, since the mobile strip has no hover
// state to hint at it. `data-cursor-label="View"` on desktop tiles feeds
// CustomCursor so the pointer itself previews the action before the click.
const SelectedLooks = () => {
  const prefersReducedMotion = useReducedMotion()
  const { item, open, close } = useLightbox()

  const tileVariants = {
    hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
  }

  const openLook = (look, event) =>
    open({ src: portfolioImages[look.image], alt: look.label, label: look.label }, event)

  return (
    <section id="portfolio" className="bg-brand-ivory px-6 pt-16 font-brand-ui lg:px-14 lg:pt-[90px]">
      <div className="mb-7 flex items-end justify-between gap-6 lg:mb-9">
        <div>
          <div className="mb-2 text-[10.5px] tracking-[.22em] text-brand-gold-deep uppercase lg:mb-3">
            Selected Looks
          </div>
          <h2 className="font-brand-display text-[24px] text-brand-text lg:text-[32px]">
            Timeless beauty. Real moments.
          </h2>
        </div>
        <a
          href="#portfolio"
          className="link-underline hidden shrink-0 pb-1 text-[12px] tracking-[.08em] text-brand-text uppercase lg:inline-block"
        >
          View portfolio
        </a>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 lg:hidden">
        {selectedLooks.map((look, index) => (
          <MotionFigure
            key={look.image}
            className="m-0 w-[140px] flex-none"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            variants={tileVariants}
            transition={{ duration: 0.5, delay: index * 0.06, ease: [0.4, 0, 0.2, 1] }}
          >
            <button
              type="button"
              onClick={(event) => openLook(look, event)}
              className="block h-[180px] w-full overflow-hidden text-left"
              aria-label={`Open ${look.label} in full size`}
            >
              <img
                src={portfolioImages[look.image]}
                alt={look.label}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
            <figcaption className="pt-2 text-[10px] tracking-[.1em] text-brand-text-faint uppercase">
              {look.label}
            </figcaption>
          </MotionFigure>
        ))}
      </div>

      {/* Desktop: keep portraits readable as the collection grows. */}
      <div className="hidden gap-3 lg:grid lg:grid-cols-4 xl:grid-cols-6">
        {selectedLooks.map((look, index) => (
          <MotionDiv
            key={look.image}
            className="img-zoom group relative aspect-[3/4] min-w-0"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={tileVariants}
            transition={{ duration: 0.6, delay: (index % 6) * 0.08, ease: [0.4, 0, 0.2, 1] }}
          >
            <button
              type="button"
              onClick={(event) => openLook(look, event)}
              data-cursor-label="View"
              className="block h-full w-full text-left"
              aria-label={`Open ${look.label} in full size`}
            >
              <img
                src={portfolioImages[look.image]}
                alt={look.label}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {/* Gradient rather than a solid chip, so the caption reads over
                  any photo without boxing off part of the image. */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end p-3"
                style={{ background: 'linear-gradient(0deg, rgba(11,11,10,.78) 0%, rgba(11,11,10,0) 100%)' }}
              >
                <span className="text-[9.5px] tracking-[.14em] text-brand-on-dark uppercase">
                  {look.label}
                </span>
              </div>
              {/* Subtle "expand" affordance for anyone whose pointer isn't
                  fine enough to trigger CustomCursor's own label. */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-on-dark/70 bg-brand-black/40 backdrop-blur-sm">
                  <Expand className="h-4 w-4 text-brand-on-dark" aria-hidden="true" />
                </span>
              </div>
            </button>
          </MotionDiv>
        ))}
      </div>

      <Lightbox item={item} onClose={close} />
    </section>
  )
}

export default SelectedLooks
