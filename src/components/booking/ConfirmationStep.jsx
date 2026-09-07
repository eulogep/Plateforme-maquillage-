import { useEffect, useRef, useState } from 'react'
import { logoEmblem, EMBLEM_ALT } from '@/assets/brand'
import { business } from '@/config/business'
import { getServiceById, formatDateLong, formatTimeLabel, formatDateKeyInBusinessTimezone, parseDurationMinutes } from '@/booking/bookingUtils'
import { describeStatus } from '@/booking/statuses'
import { getBookingStatus } from '@/booking/bookingApi'
import { generateIcs, downloadIcs } from '@/booking/generateIcs'

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

  const handleAddToCalendar = () => {
    try {
      const ics = generateIcs({
        serviceName: service?.name ?? 'Appointment',
        businessName: business.name,
        dateStr: formatDateKeyInBusinessTimezone(bookingData.date),
        startTime: bookingData.time,
        durationMinutes: parseDurationMinutes(service?.duration),
        timezone: business.location.timezone,
        locationLine: business.location.full,
        reference: bookingData.appointmentId,
      })
      downloadIcs(ics, `${(service?.name ?? 'appointment').toLowerCase().replace(/\s+/g, '-')}.ics`)
    } catch (err) {
      console.error('Could not generate calendar file', err)
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col bg-brand-ivory text-brand-text">
      {/* A branded moment rather than a photo: the ME emblem on the brand's
          deep black, closed by the board's gold rule. */}
      <div className="flex flex-col items-center gap-4 bg-brand-black px-6 py-9">
        <img
          src={logoEmblem}
          alt={EMBLEM_ALT}
          width="600"
          height="600"
          className="h-[76px] w-[76px]"
        />
        <div className="rule-gold w-24" />
      </div>

      <div className="flex flex-1 flex-col gap-3.5 p-6 lg:p-7">
        <div
          role="status"
          aria-live="polite"
          className="text-[10.5px] tracking-[.16em] text-brand-gold-deep uppercase"
        >
          {isProcessing ? 'Payment processing' : status.label}
        </div>
        <h2 className="font-brand-display text-[22px] leading-[1.3]">
          {isConfirmed ? (
            <>
              You&rsquo;re <span className="italic text-brand-copper">booked.</span>
            </>
          ) : isPaymentFailed ? (
            "Payment didn't go through."
          ) : isExpiredOrCancelled ? (
            'This hold has expired.'
          ) : (
            'Confirming your payment…'
          )}
        </h2>
        <p className="text-[12.5px] leading-[1.8] text-brand-text-muted">
          {service?.name ?? 'Selected service'} · {formatDateLong(bookingData.date)},{' '}
          {formatTimeLabel(bookingData.time)}
          <br />
          For {bookingData.client.fullName}
        </p>
        <div className="border border-brand-rule bg-brand-ivory-soft p-3.5 text-[11.5px] leading-[1.6] text-brand-text-muted">
          {isProcessing &&
            "We're waiting for your bank/Stripe to confirm the payment. This usually takes a few seconds — don't close this page."}
          {isConfirmed && "You're booked. A confirmation email should be on its way to your inbox."}
          {isPaymentFailed && 'Your card was not charged. You can try a different payment method for this same slot.'}
          {isExpiredOrCancelled &&
            'This booking hold is no longer active. Please start a new booking to pick a slot again.'}
          {pollError && ' (Having trouble checking status — this page will keep trying.)'}
          {bookingData.appointmentId && (
            <>
              {' '}
              Reference: <span className="text-brand-text">{bookingData.appointmentId}</span>
            </>
          )}
        </div>

        {isPaymentFailed && (
          <button
            type="button"
            onClick={onRetryPayment}
            className="bg-brand-black p-4 text-center text-[11.5px] tracking-[.1em] text-brand-champagne uppercase"
          >
            Try payment again
          </button>
        )}

        <button
          type="button"
          onClick={handleAddToCalendar}
          disabled={!isConfirmed}
          className="mt-auto border border-brand-gold p-4 text-center text-[11.5px] tracking-[.1em] text-brand-copper-deep uppercase disabled:opacity-45"
          title={isConfirmed ? undefined : "Add-to-calendar isn't available until the appointment is confirmed"}
        >
          Add to calendar
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="link-underline mx-auto w-fit pb-0.5 text-[11.5px] text-brand-text-muted"
        >
          Start a new booking
        </button>
      </div>
    </div>
  )
}

export default ConfirmationStep
