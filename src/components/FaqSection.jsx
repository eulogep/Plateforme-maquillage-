import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { faqs } from '@/config/business'

const FaqSection = () => (
  <section className="bg-brand-ivory-soft px-6 py-16 font-brand-ui lg:px-14 lg:py-[90px]">
    <div className="mx-auto max-w-[900px]">
      <div className="mb-9 text-center">
        <div className="mb-3 text-[10.5px] tracking-[.22em] text-brand-gold-deep uppercase">
          Good to Know
        </div>
        <h2 className="font-brand-display text-[24px] text-brand-text lg:text-[30px]">
          Questions, answered
        </h2>
        <div className="rule-gold mx-auto mt-4 w-20" />
      </div>

      <Accordion type="single" collapsible className="border-t border-brand-rule">
        {faqs.map((faq, index) => (
          <AccordionItem key={faq.question} value={`faq-${index + 1}`} className="border-brand-rule">
            <AccordionTrigger className="text-left font-brand-display text-[16px] text-brand-text hover:text-brand-copper-deep hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="max-w-[760px] text-[12.5px] leading-7 text-brand-text-muted">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
)

export default FaqSection
