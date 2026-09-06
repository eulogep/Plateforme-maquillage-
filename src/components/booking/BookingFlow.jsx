import { useState } from 'react'
import ServiceStep from './ServiceStep'
import DateTimeStep from './DateTimeStep'
import ClientDetailsStep from './ClientDetailsStep'
import ReviewStep from './ReviewStep'
import PaymentStep from './PaymentStep'
import ConfirmationStep from './ConfirmationStep'
import { getServiceById, bookingSteps, formatDateKeyInBusinessTimezone } from '@/booking/bookingUtils'
import { clientDetailsDefaultValues } from '@/booking/schemas'
import { submitBooking, generateIdempotencyKey, BookingApiError } from '@/booking/bookingApi'

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
    <section id="rendez-vous" className="bg-[#EFEAE1] px-6 py-14 font-brand-ui lg:px-14 lg:py-16">
      <div className="mx-auto max-w-md overflow-hidden bg-brand-cream shadow-[0_4px_24px_rgba(0,0,0,.1)] lg:max-w-lg">
        {/* Progress indicator, shared across all six steps */}
        <div className="flex gap-[3px] bg-[#241F1B]/[.08] p-[3px]">
          {bookingSteps.map((step, i) => (
            <div
              key={step.id}
              className="h-[3px] flex-1"
              style={{ background: i <= stepIndex ? '#1F2B47' : 'transparent' }}
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
          <PaymentStep bookingData={bookingData} onBack={goBack} onPaid={goNext} />
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

export default BookingFlow
