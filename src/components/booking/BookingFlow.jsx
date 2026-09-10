import { useState, lazy, Suspense } from 'react'
import ServiceStep from './ServiceStep'
import DateTimeStep from './DateTimeStep'
import ClientDetailsStep from './ClientDetailsStep'
import ReviewStep from './ReviewStep'
import ConfirmationStep from './ConfirmationStep'
import { getServiceById, bookingSteps, formatDateKeyInBusinessTimezone } from '@/booking/bookingUtils'
import { clientDetailsDefaultValues } from '@/booking/schemas'
import { submitBooking, generateIdempotencyKey, BookingApiError } from '@/booking/bookingApi'

// Code-split: PaymentStep pulls in @stripe/react-stripe-js + @stripe/stripe-js,
// the single heaviest dependency in the app, needed only once a visitor
// actually reaches step 5 of 6 after real interaction — most people
// browsing services/portfolio never load it at all. Same component,
// same props, same behavior; only *when* its code downloads changes.
const PaymentStep = lazy(() => import('./PaymentStep'))

const baseBookingData = {
  serviceId: '',
  date: undefined,
  time: '',
  client: clientDetailsDefaultValues,
  policiesAccepted: false,
  // Set once create-booking succeeds (see handleCreateBooking) — the
  // Payment step needs this id to create a PaymentIntent, and
  // Confirmation needs it to poll the real server-confirmed status.
  appointmentId: null,
  holdExpiresAt: null,
}

// A fresh idempotency key per mount (not baked into a shared module-level
// constant), so two independent booking attempts never start out sharing
// one by accident.
function createInitialBookingData() {
  return { ...baseBookingData, idempotencyKey: generateIdempotencyKey() }
}

// Top-level orchestrator for the 6-step booking flow. Holds all booking
// state and hands each step only what it needs.
//
// Network calls, in order: Review's "Continue to payment" calls
// create-booking (creates the appointment as 'pending' — see
// handleCreateBooking); Payment then calls create-payment-intent itself
// once it has an appointmentId, renders Stripe's Payment Element, and
// calls onPaid once the client-side payment submission completes; from
// there Confirmation POLLS the server for the real, webhook-confirmed
// status (src/booking/bookingApi.js -> getBookingStatus) rather than ever
// assuming success locally — only a verified Stripe webhook ever sets an
// appointment to 'confirmed' (see supabase/functions/stripe-webhook).
const BookingFlow = () => {
  const [stepIndex, setStepIndex] = useState(0)
  const [bookingData, setBookingData] = useState(createInitialBookingData)
  const [submission, setSubmission] = useState({ status: 'idle', errorCode: null, errorMessage: null })

  const goNext = () => setStepIndex((i) => Math.min(i + 1, bookingSteps.length - 1))
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0))

  const handleStartOver = () => {
    setBookingData(createInitialBookingData())
    setSubmission({ status: 'idle', errorCode: null, errorMessage: null })
    setStepIndex(0)
  }

  // Changing which slot is being requested makes this a logically different
  // booking request, so it gets a fresh idempotency key. Repeated submits of
  // the *same* slot/details (e.g. a double-click, or a retry after a
  // transient network error) reuse the key on purpose, so the server can
  // recognize the retry instead of creating a duplicate appointment.
  const updateSlot = (patch) =>
    setBookingData((d) => ({ ...d, ...patch, idempotencyKey: generateIdempotencyKey() }))

  const selectedService = getServiceById(bookingData.serviceId)

  const handleCreateBooking = async () => {
    setSubmission({ status: 'submitting', errorCode: null, errorMessage: null })
    try {
      const result = await submitBooking({
        payload: {
          serviceId: bookingData.serviceId,
          fullName: bookingData.client.fullName,
          email: bookingData.client.email,
          phone: bookingData.client.phone,
          occasion: bookingData.client.occasion,
          notes: bookingData.client.notes,
          date: formatDateKeyInBusinessTimezone(bookingData.date),
          startTime: bookingData.time,
          policiesAccepted: bookingData.policiesAccepted,
          idempotencyKey: bookingData.idempotencyKey,
        },
        inspirationPhoto: bookingData.client.inspirationPhoto,
      })
      setSubmission({ status: 'idle', errorCode: null, errorMessage: null })
      setBookingData((d) => ({ ...d, appointmentId: result.id, holdExpiresAt: result.holdExpiresAt ?? null }))
      goNext()
    } catch (err) {
      const code = err instanceof BookingApiError ? err.code : 'INTERNAL_ERROR'
      const message = err instanceof BookingApiError ? err.message : 'Something went wrong. Please try again.'
      setSubmission({ status: 'error', errorCode: code, errorMessage: message })

      // The slot we showed the user is no longer valid — send them back to
      // pick a new one rather than let them retry into the same wall.
      if (code === 'SLOT_UNAVAILABLE' || code === 'BLOCKED_DATE' || code === 'OUTSIDE_BUSINESS_HOURS') {
        setBookingData((d) => ({ ...d, date: undefined, time: '', idempotencyKey: generateIdempotencyKey() }))
        setStepIndex(1)
      }
    }
  }

  return (
    <section
      id="rendez-vous"
      className="bg-brand-ivory-soft px-6 py-14 font-brand-ui lg:px-14 lg:py-16"
    >
      <div className="mx-auto mb-8 max-w-md text-center lg:max-w-lg">
        <div className="mb-3 text-[10.5px] tracking-[.22em] text-brand-gold-deep uppercase">
          Book an appointment
        </div>
        <h2 className="font-brand-display text-[24px] text-brand-text lg:text-[28px]">
          Reserve your <span className="italic text-brand-copper">seat.</span>
        </h2>
        <div className="rule-gold mx-auto mt-4 w-20" />
      </div>

      <div className="mx-auto max-w-md overflow-hidden border border-brand-rule bg-brand-ivory shadow-[var(--shadow-soft)] lg:max-w-lg">
        {/*
         * Progress indicator, shared across all six steps. It is announced
         * to assistive tech as a real progressbar rather than relying on
         * the champagne fill alone to convey position.
         */}
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={bookingSteps.length}
          aria-valuenow={stepIndex + 1}
          aria-label={`Booking step ${stepIndex + 1} of ${bookingSteps.length}`}
          className="flex gap-[3px] bg-brand-rule p-[3px]"
        >
          {bookingSteps.map((step, i) => (
            <div
              key={step.id}
              className="h-[3px] flex-1 transition-colors duration-500"
              style={{ background: i <= stepIndex ? 'var(--brand-champagne)' : 'transparent' }}
            />
          ))}
        </div>

        {stepIndex === 0 && (
          <ServiceStep
            serviceId={bookingData.serviceId}
            onSelect={(serviceId) => updateSlot({ serviceId })}
            onContinue={goNext}
          />
        )}

        {stepIndex === 1 && (
          <DateTimeStep
            serviceDuration={selectedService?.duration}
            date={bookingData.date}
            time={bookingData.time}
            slotUnavailableNotice={
              submission.status === 'error' &&
              ['SLOT_UNAVAILABLE', 'BLOCKED_DATE', 'OUTSIDE_BUSINESS_HOURS'].includes(submission.errorCode)
                ? submission.errorMessage
                : null
            }
            onChangeDate={(date) => updateSlot({ date })}
            onChangeTime={(time) => setBookingData((d) => ({ ...d, time, idempotencyKey: generateIdempotencyKey() }))}
            onBack={goBack}
            onContinue={goNext}
          />
        )}

        {stepIndex === 2 && (
          <ClientDetailsStep
            defaultValues={bookingData.client}
            onSubmitStep={(client) => {
              setBookingData((d) => ({ ...d, client }))
              goNext()
            }}
            onBack={goBack}
          />
        )}

        {stepIndex === 3 && (
          <ReviewStep
            bookingData={bookingData}
            policiesAccepted={bookingData.policiesAccepted}
            onTogglePolicies={(policiesAccepted) => setBookingData((d) => ({ ...d, policiesAccepted }))}
            submission={submission}
            onBack={goBack}
            onContinue={handleCreateBooking}
          />
        )}

        {stepIndex === 4 && (
          <Suspense fallback={<StepLoadingFallback />}>
            <PaymentStep bookingData={bookingData} onBack={goBack} onPaid={goNext} />
          </Suspense>
        )}

        {stepIndex === 5 && (
          <ConfirmationStep
            bookingData={bookingData}
            onStartOver={handleStartOver}
            onRetryPayment={() => setStepIndex(4)}
          />
        )}
      </div>
    </section>
  )
}

// Matches each step's own `min-h-[70vh]` shell so the Suspense fallback
// doesn't collapse the layout while PaymentStep's chunk downloads (usually
// near-instant on a warm cache; this covers the first real fetch).
function StepLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[70vh] flex-col items-center justify-center gap-3 p-6 text-[11.5px] text-brand-text-faint"
    >
      <span className="sr-only">Loading payment step…</span>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-rule border-t-brand-gold-deep motion-reduce:animate-none" />
      <span aria-hidden="true">Loading payment…</span>
    </div>
  )
}

export default BookingFlow
