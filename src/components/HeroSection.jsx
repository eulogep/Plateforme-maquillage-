import { portfolioImages } from '@/assets/portfolio'

// The frozen design's dark editorial hero, re-art-directed onto the official
// brand palette: on mobile the photo is a full-bleed background with the copy
// overlaid at the bottom; at lg+ it splits into the two-column desktop layout.
//
// The previous magenta/gold atmospheric glows are gone — the brand board's
// look is flat and editorial, so depth now comes from the black-to-photo
// gradient alone rather than colored blur.
const HeroSection = () => {
  return (
    <section
      id="accueil"
      className="relative flex min-h-[92vh] overflow-hidden bg-brand-black font-brand-ui lg:min-h-[96vh]"
    >
      {/* Background photo — full-bleed on mobile, right 56% on desktop */}
      <div className="absolute inset-0 lg:left-[44%] lg:right-0">
        <img
          src={portfolioImages['hero-precision-elevated']}
          alt="Makeup-by Emma artistry — editorial portrait"
          className="relative z-[1] h-full w-full object-cover"
          style={{ objectPosition: '56% 10%' }}
          loading="eager"
        />
        {/* mobile: bottom-heavy fade so overlaid text stays legible */}
        <div
          className="absolute inset-0 z-[1] lg:hidden"
          style={{ background: 'linear-gradient(0deg, rgba(11,11,10,.94) 0%, rgba(11,11,10,.12) 58%)' }}
        />
        {/* desktop: left-edge fade into the black behind the copy column */}
        <div
          className="absolute inset-0 z-[1] hidden lg:block"
          style={{ background: 'linear-gradient(90deg, var(--brand-black) 0%, rgba(11,11,10,0) 24%)' }}
        />
      </div>

      {/* Copy */}
      <div className="relative z-[2] flex w-full flex-1 flex-col justify-end gap-4 px-6 pb-12 lg:w-[44%] lg:justify-center lg:gap-[22px] lg:px-16 lg:pb-0">
        <div className="flex items-center gap-3">
          <span className="h-px w-7 bg-brand-champagne" />
          <span className="text-[10.5px] tracking-[.22em] text-brand-champagne uppercase">
            Stafford, VA · On-location
          </span>
        </div>
        <h1 className="font-brand-display text-[32px] leading-[1.1] text-brand-on-dark lg:text-[56px]">
          Precision, artistry,
          <br />
          <span className="italic text-brand-champagne">elevated beauty.</span>
        </h1>
        <p className="max-w-[360px] text-[13.5px] leading-[1.7] text-brand-on-dark-muted lg:text-[14px]">
          Luxury makeup for every occasion. Natural to full glam — tailored to you.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-5">
          <a
            href="#rendez-vous"
            className="whitespace-nowrap bg-brand-champagne px-8 py-4 text-[12px] tracking-[.1em] text-brand-black no-underline uppercase transition-colors hover:bg-brand-gold-soft"
          >
            Book Now
          </a>
          <a
            href="#portfolio"
            className="link-underline py-2 text-[12px] tracking-[.08em] text-brand-on-dark uppercase"
          >
            View Portfolio
          </a>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
