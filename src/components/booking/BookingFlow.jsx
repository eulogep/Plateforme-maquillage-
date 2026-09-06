import { useState } from 'react'
import ServiceStep from './ServiceStep'
import DateTimeStep from './DateTimeStep'
import ClientDetailsStep from './ClientDetailsStep'
import ReviewStep from './ReviewStep'
import PaymentStep from './PaymentStep'
import ConfirmationStep from './ConfirmationStep'
import { getServiceById, bookingSteps } from '@/booking/bookingUtils'
import { clientDetailsDefaultValues } from '@/booking/schemas'

const initialBookingData = {
  serviceId: '',
  date: undefined,
  time: '',
  client: clientDetailsDefaultValues,
  policiesAccepted: false,
}

// Top-level orchestrator for the 6-step booking flow. Holds all booking
// state and hands each step only what it needs — no step reaches into
// another step's concerns, and none of them talk to a backend yet
// (Milestone 3 is UI-only; see src/booking/mockAvailability.js).
const BookingFlow = () => {
  const [stepIndex, setStepIndex] = useState(0)
  const [bookingData, setBookingData] = useState(initialBookingData)

  const goNext = () => setStepIndex((i) => Math.min(i + 1, bookingSteps.length - 1))
  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0))

  const handleStartOver = () => {
    setBookingData(initialBookingData)
    setStepIndex(0)
  }

  const selectedService = getServiceById(bookingData.serviceId)

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
            onSelect={(serviceId) => setBookingData((d) => ({ ...d, serviceId }))}
            onContinue={goNext}
          />
        )}

        {stepIndex === 1 && (
          <DateTimeStep
            serviceDuration={selectedService?.duration}
            date={bookingData.date}
            time={bookingData.time}
            onChangeDate={(date) => setBookingData((d) => ({ ...d, date }))}
            onChangeTime={(time) => setBookingData((d) => ({ ...d, time }))}
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
            onBack={goBack}
            onContinue={goNext}
          />
        )}

        {stepIndex === 4 && <PaymentStep bookingData={bookingData} onBack={goBack} onContinue={goNext} />}

        {stepIndex === 5 && <ConfirmationStep bookingData={bookingData} onStartOver={handleStartOver} />}
      </div>
    </section>
  )
}

export default BookingFlow
