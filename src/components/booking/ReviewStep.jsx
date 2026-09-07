import { Checkbox } from '@/components/ui/checkbox'
import { business } from '@/config/business'
import { getServiceById, formatDateLong, formatTimeLabel, formatPrice } from '@/booking/bookingUtils'
import { StepHeader, StepFooter } from './StepChrome'

// Step 4 — Review + Policies. The user must explicitly accept the booking
// policies (checkbox) before continuing; Continue stays disabled otherwise.
// Continuing here is what actually calls create-booking (the appointment
// is created as 'pending' at this point — no payment yet).
const ReviewStep = ({ bookingData, policiesAccepted, onTogglePolicies, submission, onBack, onContinue }) => {
  const service = getServiceById(bookingData.serviceId)
  const isSubmitting = submission?.status === 'submitting'
  const showError =
    submission?.status === 'error' &&
    !['SLOT_UNAVAILABLE', 'BLOCKED_DATE', 'OUTSIDE_BUSINESS_HOURS'].includes(submission.errorCode)

  return (
    <div className="flex min-h-[70vh] flex-col gap-3.5 p-6 lg:p-7">
      <StepHeader stepIndex={3} title="Review your appointment" />

      {showError && (
        <p role="alert" className="border border-brand-danger/30 bg-brand-danger/5 p-2.5 text-[11.5px] text-brand-danger-deep">
          {submission.errorMessage}
        </p>
      )}

      <div className="flex flex-col gap-2 border border-brand-rule bg-brand-ivory-soft p-4 text-[12.5px] text-brand-text-muted">
        <Row label="Service" value={service?.name ?? '—'} />
        <Row label="Date" value={formatDateLong(bookingData.date)} />
        <Row label="Time" value={formatTimeLabel(bookingData.time)} />
        <Row label="Duration" value={service?.duration ?? '—'} />
        <Row label="Location" value={business.location.full} />
        <div className="mt-0.5 flex justify-between border-t border-brand-rule pt-2">
          <span>Price</span>
          <span>{service ? `${formatPrice(service.priceFrom)} (est.)` : '—'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 border border-brand-rule bg-brand-ivory-soft p-4 text-[12.5px] text-brand-text-muted">
        <Row label="Name" value={bookingData.client.fullName} />
        <Row label="Email" value={bookingData.client.email} />
        <Row label="Phone" value={bookingData.client.phone} />
        {bookingData.client.occasion && <Row label="Occasion" value={bookingData.client.occasion} />}
      </div>

      <label className="flex items-start gap-2.5 text-[11.5px] text-brand-text-muted">
        <Checkbox
          checked={policiesAccepted}
          onCheckedChange={(checked) => onTogglePolicies(checked === true)}
          className="mt-0.5 rounded-none border-brand-text data-[state=checked]:bg-brand-black data-[state=checked]:border-brand-black data-[state=checked]:text-brand-champagne"
        />
        <span>I have read and agree to the booking policies.</span>
      </label>

      <StepFooter
        onBack={onBack}
        onContinue={onContinue}
        continueLabel={isSubmitting ? 'Submitting…' : 'Continue to payment'}
        continueDisabled={!policiesAccepted || isSubmitting}
      />
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

export default ReviewStep
