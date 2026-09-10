import { portfolioImages } from '@/assets/portfolio'
import { services, addOnServices, pricingDisclaimer } from '@/config/business'

// Matches the frozen design's "Choose your experience" section: image-led
// cards for the four primary services, plus a compact list for add-ons.
// Mobile uses the design's simplified row layout (small thumbnail + name +
// duration/price) rather than the full image cards, to match its mobile
// homepage screen.
//
// Service ids, names, durations, prices and CTA labels all come from
// config/business.js unchanged — this section is presentation only.
const ServicesSection = () => {
  return (
    <section
      id="services"
      className="bg-brand-ivory-soft px-6 py-16 font-brand-ui lg:px-14 lg:py-[90px]"
    >
      <div className="mb-2 text-center">
        <div className="mb-3 text-[10.5px] tracking-[.22em] text-brand-gold-deep uppercase">
          Services
        </div>
        <h2 className="font-brand-display text-[26px] text-brand-text lg:text-[32px]">
          Choose your experience
        </h2>
        <div className="rule-gold mx-auto mt-4 w-20" />
      </div>
      <p className="mt-5 mb-8 text-center text-[12px] text-brand-text-faint lg:mb-10">
        {pricingDisclaimer}
      </p>

      {/* Mobile: compact rows */}
      <div className="mb-8 flex flex-col gap-px bg-brand-rule lg:hidden">
        {services.map((service) => (
          <a
            key={service.id}
            href="#rendez-vous"
            className="flex items-center gap-3.5 bg-brand-ivory p-3 no-underline"
          >
            <div className="h-16 w-16 flex-none overflow-hidden">
              <img
                src={portfolioImages[service.image]}
                alt={service.headline}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center gap-1">
              <div className="font-brand-display text-[14px] text-brand-text">{service.name}</div>
              <div className="text-[10.5px] text-brand-text-faint">
                {service.duration} · From ${service.priceFrom}
                {!service.priceConfirmed && ' · Price pending confirmation'}
                {!service.durationConfirmed && ' · Duration pending confirmation'}
              </div>
            </div>
            <span className="text-[10px] tracking-[.12em] text-brand-gold-deep uppercase">Book</span>
          </a>
        ))}
      </div>

      {/* Desktop: image-led grid */}
      <div className="hidden grid-cols-4 gap-5 lg:grid">
        {services.map((service) => (
          <div
            key={service.id}
            className="card-lift img-zoom flex flex-col border border-brand-rule bg-brand-ivory"
          >
            <div className="h-[220px] overflow-hidden">
              <img
                src={portfolioImages[service.image]}
                alt={service.headline}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2.5 p-5">
              <div className="font-brand-display text-[19px] text-brand-text">
                {service.headline}
              </div>
              <p className="flex-1 text-[12px] leading-[1.6] text-brand-text-muted">
                {service.description}
              </p>
              {service.includes && (
                <ul className="space-y-1 text-[10.5px] leading-[1.5] text-brand-text-faint">
                  {service.includes.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              )}
              {service.note && (
                <p className="text-[10.5px] leading-[1.5] text-brand-copper-deep italic">{service.note}</p>
              )}
              <div className="text-[11px] text-brand-text-faint">
                {service.duration} · From{' '}
                <span className="text-brand-text">${service.priceFrom}</span>
                {!service.priceConfirmed && ' · Price pending confirmation'}
                {!service.durationConfirmed && ' · Duration pending confirmation'}
              </div>
              <a
                href="#rendez-vous"
                className="link-underline mt-1 w-fit pb-[3px] text-[11px] tracking-[.08em] text-brand-text uppercase"
              >
                {service.cta}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add-on services — compact list */}
      <div className="mx-auto mt-8 flex max-w-[820px] flex-col gap-px border border-brand-rule bg-brand-rule">
        {addOnServices.map((addOn) => (
          <div
            key={addOn.id}
            className="flex flex-wrap items-center justify-between gap-3 bg-brand-ivory px-5 py-4 text-[12.5px] text-brand-text"
          >
            <span className="min-w-[220px] flex-1">
              {addOn.name}
              {addOn.duration && <> · <span className="text-brand-text-faint">{addOn.duration}</span></>}
              {addOn.note && <span className="mt-1 block text-[11px] leading-relaxed text-brand-text-faint">{addOn.note}</span>}
            </span>
            <span className="text-brand-text-faint">
              From <span className="text-brand-text">${addOn.priceFrom}</span>
              {!addOn.priceConfirmed && ' · Price pending confirmation'}
              <a
                href={addOn.bookable === false ? '#contact' : '#rendez-vous'}
                className="link-underline ml-4 text-[11px] tracking-[.1em] text-brand-gold-deep uppercase"
              >
                {addOn.bookable === false ? 'Inquire' : 'Book'}
              </a>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ServicesSection
