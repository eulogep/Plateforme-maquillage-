import { portfolioImages } from '@/assets/portfolio'

// Matches the frozen design's dark editorial hero: on mobile the photo is a
// full-bleed background with the copy overlaid at the bottom (per the
// design's "Mobile — Homepage" screen); at lg+ it splits into the desktop
// two-column layout (copy left, photo right) with the blurred color accents.
const HeroSection = () => {
  return (
    <section
      id="accueil"
      className="relative flex min-h-[92vh] overflow-hidden bg-brand-ink font-brand-ui lg:min-h-[96vh]"
    >
      {/* Background photo — full-bleed on mobile, right 56% on desktop */}
      <div className="absolute inset-0 lg:left-[44%] lg:right-0">
        <div
          className="absolute h-[150px] w-[150px] rounded-full opacity-60 lg:h-[340px] lg:w-[340px] lg:opacity-55"
          style={{ background: '#9B2F6B', filter: 'blur(45px)', top: '-20px', right: '-10px' }}
        />
        <div
          className="absolute hidden rounded-full opacity-30 lg:block lg:h-[260px] lg:w-[260px]"
          style={{ background: '#B08D57', filter: 'blur(90px)', bottom: '5%', right: '28%' }}
        />
        <img
          src={portfolioImages['hero-precision-elevated']}
          alt="Emmanuelle Singani makeup artistry — editorial portrait"
          className="relative z-[1] h-full w-full object-cover"
          style={{ objectPosition: '56% 10%', filter: 'saturate(1.04) contrast(1.02) brightness(1.01)' }}
          loading="eager"
        />
        {/* mobile: bottom-heavy fade so overlaid text stays legible */}
        <div
          className="absolute inset-0 z-[1] lg:hidden"
          style={{ background: 'linear-gradient(0deg, rgba(20,17,13,.92) 0%, rgba(20,17,13,.1) 55%)' }}
        />
        {/* desktop: left-edge fade into the ink background behind the copy column */}
        <div
          className="absolute inset-0 z-[1] hidden lg:block"
          style={{ background: 'linear-gradient(90deg, #14110D 0%, rgba(20,17,13,0) 22%)' }}
        />
      </div>

      {/* Copy */}
      <div className="relative z-[2] flex w-full flex-1 flex-col justify-end gap-4 px-6 pb-10 lg:w-[44%] lg:justify-center lg:gap-[22px] lg:px-16 lg:pb-0">
        <div className="text-[11px] tracking-[.2em] text-brand-gold uppercase">
          Stafford, VA · On-location
        </div>
        <h1 className="font-brand-display text-[32px] leading-[1.1] text-brand-cream lg:text-[56px]">
          Precision, artistry,
          <br />
          <span className="italic text-brand-blush">elevated beauty.</span>
        </h1>
        <div className="hidden h-px w-9 bg-[#F7F1E9]/35 lg:block" />
        <p className="max-w-[360px] text-[13.5px] leading-[1.7] text-[#CBBFB2] lg:text-[14px]">
          Luxury makeup for every occasion. Natural to full glam — tailored to you.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <a
            href="#rendez-vous"
            className="whitespace-nowrap bg-brand-cream px-7 py-4 text-[12.5px] tracking-[.05em] text-brand-ink no-underline"
          >
            Book Now
          </a>
          <a
            href="#portfolio"
            className="border-b border-brand-cream pb-1 text-[12px] tracking-[.05em] text-brand-cream no-underline"
          >
            View Portfolio
          </a>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
