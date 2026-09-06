// Dark "Artistry / Signature" band. The frozen design calls for a macro
// brush/pigment photograph here but marks that asset as not yet supplied —
// design-reference/uploads/ was checked and contains no matching macro
// photography, so per instructions no photo is invented for this slot.
// Instead the panel stays visually complete using the same ink/blush/gold
// blurred-accent treatment already established in Hero and Final CTA,
// with no internal design annotation exposed to visitors.
const ArtistrySection = () => {
  return (
    <section className="relative flex flex-col overflow-hidden bg-brand-ink font-brand-ui lg:min-h-[340px] lg:flex-row">
      <div className="relative min-h-[200px] overflow-hidden bg-[#171310] lg:w-2/5">
        <div
          className="absolute h-[220px] w-[220px] rounded-full opacity-70"
          style={{ background: '#9B2F6B', filter: 'blur(70px)', top: '10%', left: '10%' }}
        />
        <div
          className="absolute h-[180px] w-[180px] rounded-full opacity-50"
          style={{ background: '#B08D57', filter: 'blur(70px)', bottom: '5%', right: '15%' }}
        />
        <div
          className="absolute h-[140px] w-[140px] rounded-full opacity-40"
          style={{ background: '#D9A0BE', filter: 'blur(60px)', top: '45%', left: '55%' }}
        />
      </div>
      <div className="flex flex-col items-center gap-4 px-6 py-14 text-center lg:w-3/5 lg:px-16 lg:py-0">
        <div className="text-[11px] tracking-[.16em] text-brand-gold uppercase">Precision, up close</div>
        <h2 className="max-w-[520px] font-brand-display text-[24px] italic text-brand-cream lg:text-[32px]">
          Every detail, considered.
        </h2>
        <p className="max-w-[440px] text-[13px] leading-[1.7] text-[#CBBFB2]">
          From skin prep to the final touch, every step is designed around the final look.
        </p>
        <a
          href="#rendez-vous"
          className="mt-2 bg-brand-cream px-7 py-3.5 text-[12px] tracking-[.05em] text-brand-ink no-underline"
        >
          Book Your Appointment
        </a>
      </div>
    </section>
  )
}

export default ArtistrySection
