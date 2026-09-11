import { portfolioImages } from '@/assets/portfolio'
import { selectedLooks } from '@/config/business'

// "Selected Looks" editorial filmstrip. Desktop: an even row filling a fixed
// height, matching the frozen design. Mobile: a horizontal-scroll strip of
// fixed-width cards, matching the design's mobile homepage screen.
//
// The photography carries this section, so it is presented unfiltered — the
// earlier saturate/contrast tweaks are removed rather than restyled.
const SelectedLooks = () => {
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
        {selectedLooks.map((look) => (
          <figure key={look.image} className="m-0 w-[140px] flex-none">
            <div className="h-[180px] overflow-hidden">
              <img
                src={portfolioImages[look.image]}
                alt={look.label}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <figcaption className="pt-2 text-[10px] tracking-[.1em] text-brand-text-faint uppercase">
              {look.label}
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Desktop: even filmstrip row */}
      <div className="hidden h-[400px] gap-[2px] overflow-hidden lg:flex">
        {selectedLooks.map((look) => (
          <div key={look.image} className="img-zoom relative min-w-0 flex-1">
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
          </div>
        ))}
      </div>
    </section>
  )
}

export default SelectedLooks
