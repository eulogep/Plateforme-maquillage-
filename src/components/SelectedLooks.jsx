import { portfolioImages } from '@/assets/portfolio'
import { selectedLooks } from '@/config/business'

// "Selected Looks" editorial filmstrip. Desktop: an even row filling a fixed
// height, matching the frozen design. Mobile: a horizontal-scroll strip of
// fixed-width cards, matching the design's mobile homepage screen.
const SelectedLooks = () => {
  return (
    <section id="portfolio" className="bg-brand-cream px-6 pt-16 font-brand-ui lg:px-14 lg:pt-[90px]">
      <div className="mb-7 flex items-end justify-between lg:mb-9">
        <div>
          <div className="mb-2 text-[11px] tracking-[.16em] text-brand-gold uppercase lg:mb-3">
            Selected Looks
          </div>
          <h2 className="font-brand-display text-[24px] text-[#241F1B] lg:text-[32px]">
            Timeless beauty. Real moments.
          </h2>
        </div>
        <a
          href="#portfolio"
          className="hidden whitespace-nowrap border-b border-[#241F1B] pb-1 text-[12.5px] tracking-[.05em] text-[#241F1B] no-underline lg:inline"
        >
          View portfolio →
        </a>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 lg:hidden">
        {selectedLooks.map((look) => (
          <div key={look.image} className="h-[180px] w-[140px] flex-none overflow-hidden">
            <img
              src={portfolioImages[look.image]}
              alt={look.label}
              className="h-full w-full object-cover"
              style={{ filter: 'saturate(1.04) contrast(1.02) brightness(1.01)' }}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Desktop: even filmstrip row */}
      <div className="hidden h-[400px] gap-[2px] overflow-hidden lg:flex">
        {selectedLooks.map((look) => (
          <div key={look.image} className="relative min-w-0 flex-1 overflow-hidden">
            <img
              src={portfolioImages[look.image]}
              alt={look.label}
              className="h-full w-full object-cover"
              style={{ filter: 'saturate(1.04) contrast(1.02) brightness(1.01)' }}
              loading="lazy"
            />
            <div className="absolute bottom-2 left-2.5 bg-[#14110D]/55 px-2 py-1 text-[9.5px] tracking-[.05em] text-brand-cream">
              {look.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default SelectedLooks
