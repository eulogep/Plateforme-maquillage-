import { portfolioImages } from '@/assets/portfolio'
import { services, addOnServices, pricingDisclaimer } from '@/config/business'

// Matches the frozen design's "Choose your experience" section: image-led
// cards for the four primary services, plus a compact list for add-ons.
// Mobile uses the design's simplified row layout (small thumbnail + name +
// duration/price) rather than the full image cards, to match its mobile
// homepage screen.
const ServicesSection = () => {
  return (
    <section id="services" className="bg-brand-cream-soft px-6 py-16 font-brand-ui lg:px-14 lg:py-[90px]">
      <div className="mb-2 text-center">
        <div className="mb-3 text-[11px] tracking-[.16em] text-brand-gold uppercase">Services</div>
        <h2 className="font-brand-display text-[26px] text-[#241F1B] lg:text-[32px]">
          Choose your experience
        </h2>
      </div>
      <p className="mb-8 text-center text-[12px] text-[#A99788] lg:mb-10">{pricingDisclaimer}</p>

      {/* Mobile: compact rows */}
      <div className="mb-6 flex flex-col gap-[2px] lg:hidden">
        {services.map((service) => (
          <a
            key={service.id}
            href="#rendez-vous"
            className="flex items-center gap-3 bg-brand-cream p-2.5 no-underline"
          >
            <div className="h-16 w-16 flex-none overflow-hidden">
              <img
                src={portfolioImages[service.image]}
                alt={service.headline}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col justify-center gap-0.5">
              <div className="font-brand-display text-[13.5px] text-[#241F1B]">{service.name}</div>
              <div className="text-[10.5px] text-[#8A7A6C]">
                {service.duration} · From ${service.priceFrom}
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Desktop: image-led grid */}
      <div className="hidden grid-cols-4 gap-5 lg:grid">
        {services.map((service) => (
          <div key={service.id} className="flex flex-col">
            <div className="h-[220px] overflow-hidden">
              <img
                src={portfolioImages[service.image]}
                alt={service.headline}
                className="h-full w-full object-cover"
                style={{ filter: 'saturate(1.04) contrast(1.02) brightness(1.01)' }}
                loading="lazy"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2.5 bg-brand-cream p-5">
              <div className="font-brand-display text-[19px] text-[#241F1B]">{service.headline}</div>
              <p className="flex-1 text-[12px] leading-[1.55] text-[#5C4F44]">{service.description}</p>
              <div className="text-[11px] text-[#8A7A6C]">
                {service.duration} · From <span className="text-[#241F1B]">${service.priceFrom}</span>
              </div>
              <a
                href="#rendez-vous"
                className="w-fit border-b border-[#241F1B] pb-[3px] text-[11px] tracking-[.04em] text-[#241F1B] no-underline"
              >
                {service.cta}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add-on services — compact list */}
      <div className="mx-auto mt-6 flex max-w-[820px] flex-col gap-px bg-[#241F1B]/[.08]">
        {addOnServices.map((addOn) => (
          <div
            key={addOn.id}
            className="flex items-center justify-between bg-brand-cream px-5 py-4 text-[12.5px]"
          >
            <span>
              {addOn.name} · {addOn.duration}
            </span>
            <span className="text-[#8A7A6C]">
              From ${addOn.priceFrom}{' '}
              <a href="#rendez-vous" className="ml-3.5 text-brand-navy no-underline underline">
                Book →
              </a>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ServicesSection
