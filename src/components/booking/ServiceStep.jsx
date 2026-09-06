import { services, addOnServices, pricingDisclaimer } from '@/config/business'
import { portfolioImages } from '@/assets/portfolio'
import { StepHeader, StepFooter } from './StepChrome'

// Step 1 — Service selection. Reads directly from src/config/business.js;
// no service data is duplicated here.
const ServiceStep = ({ serviceId, onSelect, onContinue }) => {
  return (
    <div className="flex min-h-[70vh] flex-col gap-4 p-6 lg:p-7">
      <StepHeader stepIndex={0} title="What are we getting ready for?" />
      <p className="-mt-2 text-[11px] text-[#A99788]">{pricingDisclaimer}</p>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {services.map((service) => {
          const isSelected = serviceId === service.id
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelect(service.id)}
              aria-pressed={isSelected}
              className="relative h-[130px] overflow-hidden text-left"
              style={{
                border: isSelected ? '2px solid #1F2B47' : '2px solid transparent',
                boxSizing: 'border-box',
              }}
            >
              <img
                src={portfolioImages[service.image]}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(0deg, rgba(23,18,14,.7), rgba(23,18,14,0) 62%)' }}
              />
              <div className="absolute bottom-2.5 left-4 right-4 text-brand-cream">
                <div className="font-brand-display text-[13px]">
                  {service.name} · {service.duration}
                </div>
                <div className="mt-0.5 text-[10px] text-[#E4CFC0]">
                  {service.description} · From {`$${service.priceFrom}`}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {addOnServices.length > 0 && (
        <div className="flex flex-col gap-px bg-[#241F1B]/[.08]">
          {addOnServices.map((addOn) => {
            const isSelected = serviceId === addOn.id
            return (
              <button
                key={addOn.id}
                type="button"
                onClick={() => onSelect(addOn.id)}
                aria-pressed={isSelected}
                className="flex items-center justify-between bg-brand-cream-soft px-4 py-3 text-left text-[12px]"
                style={{ outline: isSelected ? '1.5px solid #1F2B47' : 'none', outlineOffset: '-1.5px' }}
              >
                <span>
                  {addOn.name} · {addOn.duration}
                </span>
                <span className="text-[#8A7A6C]">From ${addOn.priceFrom}</span>
              </button>
            )
          })}
        </div>
      )}

      <StepFooter onContinue={onContinue} continueDisabled={!serviceId} />
    </div>
  )
}

export default ServiceStep
