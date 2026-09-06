import { portfolioImages } from '@/assets/portfolio'
import { about, business, testimonial } from '@/config/business'

// Combined "About + Kind Words" section per the frozen design: a three-column
// grid on desktop (About / photo / Testimonial), stacked on mobile. The
// testimonial is rendered as an explicit placeholder — the design has no
// real client quote yet, so none is invented here.
const AboutSection = () => {
  return (
    <section
      id="histoire"
      className="grid grid-cols-1 items-center gap-8 bg-brand-cream px-6 py-14 font-brand-ui lg:grid-cols-[1fr_.7fr_1fr] lg:gap-11 lg:px-14 lg:py-[90px]"
    >
      {/* About */}
      <div className="flex flex-col gap-3.5">
        <div className="text-[11px] tracking-[.16em] text-brand-gold uppercase">About Emmanuelle</div>
        <h2 className="font-brand-display text-[22px] leading-[1.3] text-[#241F1B] lg:text-[25px]">
          Artistry with intention.
        </h2>
        <p className="text-[13px] leading-[1.7] text-[#5C4F44]">
          {about.bio} <span className="text-[#A99788]">{about.bioPlaceholder}</span>
        </p>
        <div className="text-[12px] text-[#8A7A6C]">
          {business.location.full} — serving {business.location.areaServed}.
        </div>
        <div className="mt-1.5 flex flex-wrap gap-4 text-[10.5px] tracking-[.05em] text-[#8A7A6C] uppercase">
          {about.badges.map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>
        <a
          href="#histoire"
          className="mt-1 w-fit border-b border-[#241F1B] pb-[3px] text-[12px] tracking-[.05em] text-[#241F1B] no-underline"
        >
          Learn more about me →
        </a>
      </div>

      {/* Photo */}
      <div className="relative h-[280px] overflow-hidden lg:h-[400px]">
        <img
          src={portfolioImages['about-emmanuelle']}
          alt="Emmanuelle Singani"
          className="h-full w-full object-cover"
          style={{ objectPosition: '50% 14%', filter: 'saturate(1.04) contrast(1.02) brightness(1.01)' }}
          loading="lazy"
        />
      </div>

      {/* Kind Words / Testimonial */}
      <div className="flex flex-col gap-3.5">
        <div className="text-[11px] tracking-[.16em] text-brand-gold uppercase">Kind Words</div>
        <div className="font-brand-display text-[34px] leading-none text-brand-gold">&ldquo;</div>
        <p className="-mt-4 font-brand-display text-[16px] leading-[1.6] text-[#3A2E25] italic">
          {testimonial.quote ?? testimonial.quotePlaceholder}
        </p>
        <div className="text-[11.5px] text-[#8A7A6C]">
          — {testimonial.clientName ?? testimonial.clientNamePlaceholder}
        </div>
        <div className="mt-1 flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#241F1B]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#241F1B]/25" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#241F1B]/25" />
        </div>
      </div>
    </section>
  )
}

export default AboutSection
