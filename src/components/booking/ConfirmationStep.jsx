import { useEffect, useRef, useState } from 'react'
import { portfolioImages } from '@/assets/portfolio'
import { getServiceById, formatDateLong, formatTimeLabel } from '@/booking/bookingUtils'
import { describeStatus } from '@/booking/statuses'
import { getBookingStatus } from '@/booking/bookingApi'

const POLL_INTERVAL_MS = 2500
const MAX_POLL_ATTEMPTS = 48 // ~2 minutes

// Step 6 — Confirmation. Reflects REAL server state, polled after payment
// submission — never assumes success just because Stripe's client-side
// confirmPayment() returned without an error. Only a verified Stripe
// webhook ever sets an appointment to 'confirmed' (supabase/functions/
// stripe-webhook); until this poll sees that, the screen says "processing",
// never "confirmed" or "booked".
const ConfirmationStep = ({ bookingData, onStartOver, onRetryPayment }) => {
  const service = getServiceById(bookingData.serviceId)
  const [polled, setPolled] = useState(null) // { status, payment_status } | null while first load pending
  const [pollError, setPollError] = useState(false)
  const attemptsRef = useRef(0)

  useEffect(() => {
    if (!bookingData.appointmentId) return
    let cancelled = false
    let timeoutId

    const poll = async () => {
      try {
        const result = await getBookingStatus(bookingData.appointmentId)
        if (cancelled) return
        setPolled(result)
        attemptsRef.current += 1

        const stillWaiting = result?.status === 'payment_pending' && result?.payment_status !== 'failed' && result?.payment_status !== 'canceled'
        if (stillWaiting && attemptsRef.current < MAX_POLL_ATTEMPTS) {
          timeoutId = setTimeout(poll, POLL_INTERVAL_MS)
        }
      } catch {
        if (!cancelled) setPollError(true)
      }
    }
    poll()

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [bookingData.appointmentId])

  const derivedStatus = polled?.status ?? 'payment_pending'
  const paymentStatus = polled?.payment_status
  const isConfirmed = derivedStatus === 'confirmed'
  const isPaymentFailed = derivedStatus === 'payment_pending' && (paymentStatus === 'failed' || paymentStatus === 'canceled')
  const isExpiredOrCancelled = derivedStatus === 'expired' || derivedStatus === 'cancelled'
  const isProcessing = !isConfirmed && !isPaymentFailed && !isExpiredOrCancelled

  const status = describeStatus(derivedStatus)

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
        <div className="text-[10px] tracking-[.08em] text-brand-gold uppercase">
          {isProcessing ? 'Payment processing' : status.label}
        </div>
        <h2 className="font-brand-display text-[22px] italic">
          {isConfirmed
            ? "You're booked."
            : isPaymentFailed
              ? "Payment didn't go through."
              : isExpiredOrCancelled
                ? 'This hold has expired.'
                : 'Confirming your payment…'}
        </h2>
        <p className="text-[12.5px] leading-[1.8] text-[#CBD1DC]">
          {service?.name ?? 'Selected service'} · {formatDateLong(bookingData.date)},{' '}
          {formatTimeLabel(bookingData.time)}
          <br />
          For {bookingData.client.fullName}
        </p>
        <div className="border border-[#F7F1E9]/20 p-3.5 text-[11.5px] leading-[1.6] text-[#CBD1DC]">
          {isProcessing &&
            "We're waiting for your bank/Stripe to confirm the payment. This usually takes a few seconds — don't close this page."}
          {isConfirmed &&
            "You're booked. A confirmation email isn't sent yet — Emmanuelle's team will follow up directly."}
          {isPaymentFailed && 'Your card was not charged. You can try a different payment method for this same slot.'}
          {isExpiredOrCancelled &&
            'This booking hold is no longer active. Please start a new booking to pick a slot again.'}
          {pollError && ' (Having trouble checking status — this page will keep trying.)'}
          {bookingData.appointmentId && (
            <>
              {' '}
              Reference: <span className="text-brand-cream">{bookingData.appointmentId}</span>
            </>
          )}
        </div>

        {isPaymentFailed && (
          <button
            type="button"
            onClick={onRetryPayment}
            className="bg-brand-cream p-3.5 text-center text-[11.5px] tracking-[.04em] text-brand-ink"
          >
            Try payment again
          </button>
        )}

        <button
          type="button"
          disabled={!isConfirmed}
          className="mt-auto border border-[#F7F1E9]/50 p-3.5 text-center text-[11.5px] tracking-[.04em] disabled:opacity-50"
          title={isConfirmed ? undefined : "Add-to-calendar isn't available until the appointment is confirmed"}
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
