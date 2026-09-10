import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { policies, policiesDisclaimer, policyBodyPlaceholder } from '@/config/business'

// Booking policies accordion. All five bodies are explicit placeholders per
// the frozen design ("[To be confirmed]") — none is invented here; this
// section stays empty of real policy text until Emmanuelle confirms it.
//
// Accordion behavior and data source are untouched; only the surface,
// separators and open/focus states are rebranded.
const PoliciesSection = () => {
  return (
    <section
      id="policies"
      className="bg-brand-ivory px-6 py-16 font-brand-ui lg:px-14 lg:py-[70px] lg:pb-[90px]"
    >
      <div className="mb-2 text-center">
        <div className="mb-3 text-[10.5px] tracking-[.22em] text-brand-gold-deep uppercase">
          Good to Know
        </div>
        <h2 className="font-brand-display text-[24px] text-brand-text lg:text-[30px]">
          Booking policies
        </h2>
        <div className="rule-gold mx-auto mt-4 w-20" />
      </div>
      <p className="mt-5 mb-7 text-center text-[11.5px] text-brand-text-faint lg:mb-[34px]">
        {policiesDisclaimer}
      </p>

      <Accordion
        type="multiple"
        className="mx-auto grid max-w-[1000px] grid-cols-1 gap-px border border-brand-rule bg-brand-rule lg:grid-cols-5"
      >
        {policies.map((policy) => (
          <AccordionItem
            key={policy.id}
            value={policy.id}
            className="border-none bg-brand-ivory-soft px-4 py-1 data-[state=open]:bg-brand-powder-pink/45"
          >
            <AccordionTrigger className="text-[12px] text-brand-text hover:no-underline data-[state=open]:text-brand-copper-deep">
              {policy.title}
            </AccordionTrigger>
            <AccordionContent className="text-[11.5px] leading-[1.6] text-brand-text-muted">
              {policy.body ?? policyBodyPlaceholder}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-6 text-center text-[11.5px] text-brand-text-faint">
        Questions about booking policies?{' '}
        <a
          href="#contact"
          className="link-underline ml-1 text-[11px] tracking-[.1em] text-brand-gold-deep uppercase"
        >
          Contact Emmanuelle
        </a>
      </div>
    </section>
  )
}

export default PoliciesSection
