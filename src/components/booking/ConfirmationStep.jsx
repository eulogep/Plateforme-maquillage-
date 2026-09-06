import { portfolioImages } from '@/assets/portfolio'
import { getServiceById, formatDateLong, formatTimeLabel } from '@/booking/bookingUtils'
import { describeStatus } from '@/booking/statuses'

// Step 6 — Confirmation. Shows the *actual* status the server returned
// (src/booking/statuses.js) — since no payment step is wired up yet, that
// status is always 'pending' right now, and this screen says so plainly
// rather than claiming the appointment is confirmed or paid.
const ConfirmationStep = ({ bookingData, result, onStartOver }) => {
  const service = getServiceById(bookingData.serviceId)
  const status = describeStatus(result?.status)

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
        <div className="text-[10px] tracking-[.08em] text-brand-gold uppercase">{status.label}</div>
        <h2 className="font-brand-display text-[22px] italic">Your booking request is in.</h2>
        <p className="text-[12.5px] leading-[1.8] text-[#CBD1DC]">
          {service?.name ?? 'Selected service'} · {formatDateLong(bookingData.date)},{' '}
          {formatTimeLabel(bookingData.time)}
          <br />
          For {bookingData.client.fullName}
        </p>
        <div className="border border-[#F7F1E9]/20 p-3.5 text-[11.5px] leading-[1.6] text-[#CBD1DC]">
          {status.description} A confirmation email isn't sent yet either — Emmanuelle's team will follow up
          directly.
          {result?.id && (
            <>
              {' '}
              Reference: <span className="text-brand-cream">{result.id}</span>
            </>
          )}
        </div>
        <button
          type="button"
          disabled
          className="mt-auto border border-[#F7F1E9]/50 p-3.5 text-center text-[11.5px] tracking-[.04em] opacity-50"
          title="Add-to-calendar isn't available until the appointment is confirmed"
        >
          Add to calendar (coming soon)
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="border-b border-brand-cream/60 pb-0.5 text-[11.5px] text-brand-cream/80 hover:text-brand-cream"
        >
          Start a new booking
        </button>
      </div>
    </div>
  )
}

export default ConfirmationStep
