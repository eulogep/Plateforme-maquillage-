import { logoLockupOnDark, LOCKUP_ALT } from '@/assets/brand'

// Closing call-to-action band. Deep black ground, the full official lockup,
// an elegant serif statement and a single champagne CTA — no decoration
// beyond one hairline rule.
const FinalCta = () => {
  return (
    <section className="flex flex-col items-center justify-center gap-5 bg-brand-black px-6 py-16 text-center font-brand-ui lg:px-14 lg:py-20">
      <img
        src={logoLockupOnDark}
        alt={LOCKUP_ALT}
        width="2172"
        height="724"
        className="h-auto w-[220px] max-w-full lg:w-[260px]"
      />
      <div className="rule-gold w-24" />
      <h2 className="max-w-[560px] font-brand-display text-[24px] leading-[1.3] text-brand-on-dark lg:text-[32px]">
        Ready to <span className="italic text-brand-champagne">look and feel</span> your best?
      </h2>
      <p className="text-[13px] text-brand-on-dark-muted">Let&rsquo;s create your perfect look.</p>
      <a
        href="#rendez-vous"
        className="mt-1 bg-brand-champagne px-8 py-4 text-[12px] tracking-[.1em] text-brand-black no-underline uppercase transition-colors hover:bg-brand-gold-soft"
      >
        Book Your Appointment
      </a>
    </section>
  )
}

export default FinalCta
