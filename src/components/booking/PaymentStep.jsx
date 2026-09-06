import { business } from '@/config/business'
import { getServiceById, formatPrice } from '@/booking/bookingUtils'
import { StepHeader, StepFooter } from './StepChrome'

const PAYMENT_METHODS = ['Zelle', 'Cash App', 'Apple Pay', 'Google Pay', 'Card', 'PayPal', 'Cash']

// Step 5 — Payment. No payment processor is connected yet, so every method
// is shown as unavailable and Continue never implies a charge was made.
// Continuing here is what actually submits the booking request to the
// server (see BookingFlow.handleSubmit) — everything up to this point has
// been local state only.
const PaymentStep = ({ bookingData, submission, onBack, onContinue }) => {
  const service = getServiceById(bookingData.serviceId)
  const isSubmitting = submission?.status === 'submitting'
  const showGenericError =
    submission?.status === 'error' &&
    !['SLOT_UNAVAILABLE', 'BLOCKED_DATE', 'OUTSIDE_BUSINESS_HOURS'].includes(submission.errorCode)

  return (
    <div className="flex min-h-[70vh] flex-col gap-3.5 p-6 lg:p-7">
      <StepHeader stepIndex={4} title="Secure your slot" />

      {showGenericError && (
        <p className="border border-[#B23B3B]/30 bg-[#B23B3B]/5 p-2.5 text-[11.5px] text-[#8A2E2E]">
          {submission.errorMessage}
        </p>
      )}

      <div className="flex flex-col gap-2 border border-[#241F1B]/[.08] bg-brand-cream-soft p-4 text-[12.5px] text-[#4A3E35]">
        <div className="flex justify-between">
          <span>Total</span>
          <span>{service ? `${formatPrice(service.priceFrom)} (est.)` : '—'}</span>
        </div>
        <div className="flex justify-between">
          <span>Deposit due now</span>
          <span className="text-right text-[#8A7A6C]">{business.deposit.note}</span>
        </div>
        <div className="flex justify-between text-[#8A7A6C]">
          <span>Remaining balance</span>
          <span className="text-right">Calculated once deposit terms are confirmed</span>
        </div>
      </div>

      <div className="text-[11px] tracking-[.06em] text-[#8A7A6C] uppercase">Payment method</div>
      <div className="flex flex-col gap-1.5">
        {PAYMENT_METHODS.map((method) => (
          <div
            key={method}
            className="flex items-center justify-between border border-[#241F1B]/15 px-3 py-2.5 text-[11.5px] text-[#8A7A6C]"
          >
            <span>{method}</span>
            <span className="text-[10px] tracking-[.04em] text-[#A99788] uppercase">Not yet connected</span>
          </div>
        ))}
      </div>

      <StepFooter
        onBack={onBack}
        onContinue={onContinue}
        continueLabel={isSubmitting ? 'Submitting…' : 'Continue to confirmation'}
        continueDisabled={isSubmitting}
        note="🔒 No payment method is connected yet — nothing will be charged."
      />
    </div>
  )
}

export default PaymentStep
