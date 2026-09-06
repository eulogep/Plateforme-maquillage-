// Closing call-to-action band matching the frozen design.
const FinalCta = () => {
  return (
    <section className="relative flex min-h-[220px] flex-col items-center justify-center gap-3 overflow-hidden bg-brand-navy px-6 py-14 text-center font-brand-ui lg:px-14">
      <div
        className="absolute h-[260px] w-[260px] rounded-full opacity-40"
        style={{ background: '#9B2F6B', filter: 'blur(90px)', bottom: '-80px', right: '5%' }}
      />
      <h2 className="relative z-[1] font-brand-display text-[24px] italic text-brand-cream lg:text-[32px]">
        Ready to <span className="text-brand-blush">look and feel</span> your best?
      </h2>
      <p className="relative z-[1] text-[13px] text-[#CBD1DC]">Let's create your perfect look.</p>
      <a
        href="#rendez-vous"
        className="relative z-[1] mt-2 bg-brand-cream px-7 py-3.5 text-[12.5px] tracking-[.05em] text-brand-navy no-underline"
      >
        Book Your Appointment
      </a>
    </section>
  )
}

export default FinalCta
