import { Check } from 'lucide-react'
import { services, addOnServices, pricingDisclaimer } from '@/config/business'
import { portfolioImages } from '@/assets/portfolio'
import { StepHeader, StepFooter } from './StepChrome'

// Step 1 — Service selection. Reads directly from src/config/business.js;
// no service data is duplicated here.
//
// Selection is never signalled by the champagne border alone: a checkmark
// badge marks the chosen card too, and `aria-pressed` carries it to
// assistive tech.
const ServiceStep = ({ serviceId, onSelect, onContinue }) => {
  return (
    <div className="flex min-h-[70vh] flex-col gap-4 p-6 lg:p-7">
      <StepHeader stepIndex={0} title="What are we getting ready for?" />
      <p className="-mt-2 text-[11px] text-brand-text-faint">{pricingDisclaimer}</p>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {services.map((service) => {
          const isSelected = serviceId === service.id
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelect(service.id)}
              aria-pressed={isSelected}
              className="relative h-[130px] overflow-hidden text-left transition-colors"
              style={{
                border: isSelected ? '2px solid var(--brand-champagne)' : '2px solid transparent',
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
                style={{ background: 'linear-gradient(0deg, rgba(11,11,10,.78), rgba(11,11,10,0) 62%)' }}
              />
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-champagne">
                  <Check className="h-3.5 w-3.5 text-brand-black" strokeWidth={3} />
                </span>
              )}
              <div className="absolute right-4 bottom-2.5 left-4 text-brand-on-dark">
                <div className="font-brand-display text-[13.5px]">
                  {service.name} · {service.duration}
                </div>
                <div className="mt-0.5 text-[10px] text-brand-on-dark-muted">
                  {service.description} · From {`$${service.priceFrom}`}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {addOnServices.length > 0 && (
        <div className="flex flex-col gap-px border border-brand-rule bg-brand-rule">
          {addOnServices.map((addOn) => {
            const isSelected = serviceId === addOn.id
            return (
              <button
                key={addOn.id}
                type="button"
                onClick={() => onSelect(addOn.id)}
                aria-pressed={isSelected}
                className={`flex items-center justify-between px-4 py-3 text-left text-[12px] text-brand-text transition-colors ${
                  isSelected ? 'bg-brand-powder-pink/50' : 'bg-brand-ivory-soft'
                }`}
                style={
                  isSelected
                    ? { outline: '1.5px solid var(--brand-champagne)', outlineOffset: '-1.5px' }
                    : undefined
                }
              >
                <span className="flex items-center gap-2">
                  {isSelected && <Check className="h-3.5 w-3.5 text-brand-copper-deep" strokeWidth={3} />}
                  {addOn.name} · <span className="text-brand-text-faint">{addOn.duration}</span>
                </span>
                <span className="text-brand-text-faint">From ${addOn.priceFrom}</span>
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
