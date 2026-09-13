import { portfolioImages } from '@/assets/portfolio'
import { about, business, testimonials } from '@/config/business'

// Combined "About + Kind Words" section per the frozen design: a three-column
// grid on desktop (About / photo / Testimonials), stacked on mobile. Content
// was confirmed after the secondary-site audit on 2026-09-10.
//
// This is the one place the artist's personal name belongs: it is biography,
// not branding, so it stays "Emmanuelle" even though the business now trades
// as Makeup-by Emma.
const AboutSection = () => {
  return (
    <section
      id="histoire"
      className="grid grid-cols-1 items-center gap-10 bg-brand-ivory px-6 py-14 font-brand-ui lg:grid-cols-[1fr_.7fr_1fr] lg:gap-11 lg:px-14 lg:py-[90px]"
    >
      {/* About */}
      <div className="flex flex-col gap-3.5">
        <div className="text-[10.5px] tracking-[.22em] text-brand-gold-deep uppercase">
          About {business.artistName.split(' ')[0]}
        </div>
        <h2 className="font-brand-display text-[22px] leading-[1.3] text-brand-text lg:text-[25px]">
          Artistry with <span className="italic text-brand-copper">intention.</span>
        </h2>
        <p className="text-[13px] leading-[1.7] text-brand-text-muted">
          {about.bio} {about.bioPlaceholder && <span className="text-brand-text-faint">{about.bioPlaceholder}</span>}
        </p>
        <p className="font-brand-display text-[15px] text-brand-copper italic">“{about.philosophy}”</p>
        <div className="text-[12px] text-brand-text-faint">
          {business.location.full} — serving {business.location.areaServed}.
        </div>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {about.badges.map((badge) => (
            <span
              key={badge}
              className="border border-brand-rule px-3 py-1.5 text-[10px] tracking-[.1em] text-brand-text-faint uppercase"
            >
              {badge}
            </span>
          ))}
        </div>
        <dl className="mt-1 grid grid-cols-3 gap-3 border-t border-brand-rule pt-4">
          {about.stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-[9px] tracking-[.08em] text-brand-text-faint uppercase">{stat.label}</dt>
              <dd className="font-brand-display text-[18px] text-brand-text">{stat.value}</dd>
            </div>
          ))}
        </dl>
        <a
          href="#histoire"
          className="link-underline mt-2 w-fit pb-[3px] text-[11.5px] tracking-[.08em] text-brand-text uppercase"
        >
          Learn more about me
        </a>
      </div>

      {/* Photo */}
      <div className="relative h-[280px] overflow-hidden lg:h-[400px]">
        <img
          src={portfolioImages['about-emmanuelle']}
          alt={business.artistName}
          className="h-full w-full object-cover"
          style={{ objectPosition: '50% 14%' }}
          loading="lazy"
        />
      </div>

      {/* Kind Words / Testimonial */}
      <div className="flex flex-col gap-3.5 border-l-0 lg:border-l lg:border-brand-rule lg:pl-10">
        <div className="text-[10.5px] tracking-[.22em] text-brand-gold-deep uppercase">
          Kind Words
        </div>
        {testimonials.map((testimonial) => (
          <blockquote key={testimonial.clientName} className="border-b border-brand-rule pb-4 last:border-0">
            <p className="font-brand-display text-[14px] leading-[1.6] text-brand-text-muted italic">
              “{testimonial.quote}”
            </p>
            <footer className="mt-2 text-[10.5px] text-brand-text-faint">— {testimonial.clientName}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  )
}

export default AboutSection
