// Dark "Artistry / Signature" band. The frozen design explicitly marks this
// section's visual as unresolved — "macro brush + pigment photography —
// asset needed" — so no photo is used here; that placeholder note is
// rendered verbatim rather than substituted with a stand-in image.
const ArtistrySection = () => {
  return (
    <section className="relative flex flex-col overflow-hidden bg-brand-ink font-brand-ui lg:min-h-[340px] lg:flex-row">
      <div className="relative min-h-[200px] overflow-hidden bg-[#171310] lg:w-2/5">
        <div
          className="absolute h-[200px] w-[200px] rounded-full opacity-70"
          style={{ background: '#9B2F6B', filter: 'blur(70px)', top: '10%', left: '10%' }}
        />
        <div
          className="absolute h-[160px] w-[160px] rounded-full opacity-50"
          style={{ background: '#B08D57', filter: 'blur(70px)', bottom: '5%', right: '15%' }}
        />
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <div className="relative z-[1] font-mono text-[10.5px] text-brand-blush">
            macro brush + pigment photography — asset needed
          </div>
        </div>
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
