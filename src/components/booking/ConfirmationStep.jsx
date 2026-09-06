import { useMemo } from 'react'
import { portfolioImages } from '@/assets/portfolio'
import { getServiceById, formatDateLong, formatTimeLabel, generateMockBookingReference } from '@/booking/bookingUtils'

// Step 6 — Confirmation. Milestone 3 is UI-only: nothing has been persisted
// or charged, so this screen deliberately does not say "confirmed" or
// "booked" the way the frozen design's mockup text does — that would be
// false until a real backend (Milestone 4+) actually saves the appointment
// and a payment processor (Milestone 6+) actually runs a charge.
const ConfirmationStep = ({ bookingData, onStartOver }) => {
  const service = getServiceById(bookingData.serviceId)
  // Client-side only, for display — not a persisted record id.
  const reference = useMemo(() => generateMockBookingReference(), [])

  return (
    <div className="flex min-h-[70vh] flex-col bg-brand-navy text-brand-cream">
      <div className="relative h-[220px] overflow-hidden">
        <img
          src={portfolioImages['hero-precision-elevated']}
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: 'saturate(1.04) contrast(1.02) brightness(1.01)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(31,43,71,0) 40%, rgba(31,43,71,.95) 100%)' }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-3.5 p-6 lg:p-7">
        <div className="text-[10px] tracking-[.08em] text-brand-gold">PREVIEW — NOT YET SUBMITTED</div>
        <h2 className="font-brand-display text-[22px] italic">Here's your booking preview.</h2>
        <p className="text-[12.5px] leading-[1.8] text-[#CBD1DC]">
          {service?.name ?? 'Selected service'} · {formatDateLong(bookingData.date)},{' '}
          {formatTimeLabel(bookingData.time)}
          <br />
          For {bookingData.client.fullName}
        </p>
        <div className="border border-[#F7F1E9]/20 p-3.5 text-[11.5px] leading-[1.6] text-[#CBD1DC]">
          This is a preview only — no appointment has been booked, no confirmation has been sent, and no
          payment has been taken. Online booking submission, real-time availability, and payment aren't
          connected yet. Reference: <span className="text-brand-cream">{reference}</span>
        </div>
        <button
          type="button"
          disabled
          className="mt-auto border border-[#F7F1E9]/50 p-3.5 text-center text-[11.5px] tracking-[.04em] opacity-50"
          title="Add-to-calendar isn't available until a booking can actually be confirmed"
        >
          Add to calendar (coming soon)
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="border-b border-brand-cream/60 pb-0.5 text-[11.5px] text-brand-cream/80 hover:text-brand-cream"
        >
          Start a new booking preview
        </button>
      </div>
    </div>
  )
}

export default ConfirmationStep
