import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { policies, policiesDisclaimer, policyBodyPlaceholder } from '@/config/business'

// Booking policies accordion. All five bodies are explicit placeholders per
// the frozen design ("[To be confirmed]") — none is invented here; this
// section stays empty of real policy text until Emmanuelle confirms it.
const PoliciesSection = () => {
  return (
    <section id="policies" className="bg-brand-cream-soft px-6 py-16 font-brand-ui lg:px-14 lg:py-[70px] lg:pb-[90px]">
      <div className="mb-2 text-center">
        <div className="mb-3 text-[11px] tracking-[.16em] text-brand-gold uppercase">Good to Know</div>
        <h2 className="font-brand-display text-[24px] text-[#241F1B] lg:text-[30px]">Booking policies</h2>
      </div>
      <p className="mb-7 text-center text-[11.5px] text-[#A99788] lg:mb-[34px]">{policiesDisclaimer}</p>

      <Accordion
        type="multiple"
        className="mx-auto grid max-w-[1000px] grid-cols-1 gap-px bg-[#241F1B]/[.08] lg:grid-cols-5"
      >
        {policies.map((policy) => (
          <AccordionItem key={policy.id} value={policy.id} className="border-none bg-brand-cream px-4 py-1">
            <AccordionTrigger className="text-[12px] hover:no-underline">{policy.title}</AccordionTrigger>
            <AccordionContent className="text-[11.5px] leading-[1.6] text-[#5C4F44]">
              {policy.body ?? policyBodyPlaceholder}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-5 text-center text-[11.5px] text-[#8A7A6C]">
        Full policy details available on the policies page.{' '}
        <a href="#policies" className="border-b border-brand-navy text-brand-navy no-underline">
          View all policies →
        </a>
      </div>
    </section>
  )
}

export default PoliciesSection
