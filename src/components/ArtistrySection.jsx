import { logoEmblem, EMBLEM_ALT } from '@/assets/brand'

// Dark "Artistry / Signature" band. The frozen design calls for a macro
// brush/pigment photograph here but marks that asset as not yet supplied —
// design-reference/uploads/ was checked and contains no matching macro
// photography, so per instructions no photo is invented for this slot.
//
// With the official identity now in hand, that panel becomes a deliberate
// brand moment instead: the ME emblem on deep black, framed by the board's
// thin gold rule. No internal design annotation is exposed to visitors.
const ArtistrySection = () => {
  return (
    <section className="flex flex-col overflow-hidden bg-brand-black font-brand-ui lg:min-h-[360px] lg:flex-row">
      <div className="flex min-h-[220px] items-center justify-center bg-brand-charcoal p-10 lg:w-2/5">
        <div className="flex flex-col items-center gap-5">
          <img
            src={logoEmblem}
            alt={EMBLEM_ALT}
            width="600"
            height="600"
            className="h-[120px] w-[120px] lg:h-[150px] lg:w-[150px]"
          />
          <div className="rule-gold w-32" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-4 px-6 py-14 text-center lg:w-3/5 lg:justify-center lg:px-16 lg:py-0">
        <div className="text-[10.5px] tracking-[.22em] text-brand-champagne uppercase">
          Precision, up close
        </div>
        <h2 className="max-w-[520px] font-brand-display text-[24px] leading-[1.3] text-brand-on-dark lg:text-[32px]">
          Every detail, <span className="italic text-brand-champagne">considered.</span>
        </h2>
        <p className="max-w-[440px] text-[13px] leading-[1.7] text-brand-on-dark-muted">
          From skin prep to the final touch, every step is designed around the final look.
        </p>
        <a
          href="#rendez-vous"
          className="mt-3 border border-brand-champagne px-7 py-3.5 text-[11.5px] tracking-[.1em] text-brand-champagne no-underline uppercase transition-colors hover:bg-brand-champagne hover:text-brand-black"
        >
          Book Your Appointment
        </a>
      </div>
    </section>
  )
}

export default ArtistrySection
