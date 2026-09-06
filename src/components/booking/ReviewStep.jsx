import { Checkbox } from '@/components/ui/checkbox'
import { business } from '@/config/business'
import { getServiceById, formatDateLong, formatTimeLabel, formatPrice } from '@/booking/bookingUtils'
import { StepHeader, StepFooter } from './StepChrome'

// Step 4 — Review + Policies. The user must explicitly accept the booking
// policies (checkbox) before continuing; Continue stays disabled otherwise.
const ReviewStep = ({ bookingData, policiesAccepted, onTogglePolicies, onBack, onContinue }) => {
  const service = getServiceById(bookingData.serviceId)

  return (
    <div className="flex min-h-[70vh] flex-col gap-3.5 p-6 lg:p-7">
      <StepHeader stepIndex={3} title="Review your appointment" />

      <div className="flex flex-col gap-2 border border-[#241F1B]/[.08] bg-brand-cream-soft p-4 text-[12.5px] text-[#4A3E35]">
        <Row label="Service" value={service?.name ?? '—'} />
        <Row label="Date" value={formatDateLong(bookingData.date)} />
        <Row label="Time" value={formatTimeLabel(bookingData.time)} />
        <Row label="Duration" value={service?.duration ?? '—'} />
        <Row label="Location" value={business.location.full} />
        <div className="mt-0.5 flex justify-between border-t border-[#241F1B]/10 pt-2">
          <span>Price</span>
          <span>{service ? `${formatPrice(service.priceFrom)} (est.)` : '—'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 border border-[#241F1B]/[.08] bg-brand-cream-soft p-4 text-[12.5px] text-[#4A3E35]">
        <Row label="Name" value={bookingData.client.fullName} />
        <Row label="Email" value={bookingData.client.email} />
        <Row label="Phone" value={bookingData.client.phone} />
        {bookingData.client.occasion && <Row label="Occasion" value={bookingData.client.occasion} />}
      </div>

      <label className="flex items-start gap-2.5 text-[11.5px] text-[#4A3E35]">
        <Checkbox
          checked={policiesAccepted}
          onCheckedChange={(checked) => onTogglePolicies(checked === true)}
          className="mt-0.5 rounded-none border-[#1F2B47] data-[state=checked]:bg-brand-navy data-[state=checked]:border-brand-navy"
        />
        <span>I have read and agree to the booking policies.</span>
      </label>

      <StepFooter
        onBack={onBack}
        onContinue={onContinue}
        continueLabel="Continue to payment"
        continueDisabled={!policiesAccepted}
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
