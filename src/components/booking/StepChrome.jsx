// Small shared chrome used by every booking step: the "STEP X OF 6" +
// heading header, and the Back/Continue footer. Kept out of BookingFlow so
// each step file stays self-contained, without duplicating this markup six
// times.
import { bookingSteps } from '@/booking/bookingUtils'

// Not exported — this file exports components only, so Fast Refresh stays
// happy (react-refresh/only-export-components).
const TOTAL_STEPS = bookingSteps.length

export function StepHeader({ stepIndex, title }) {
  return (
    <div className="mb-1">
      <div className="mb-1.5 text-[10px] tracking-[.08em] text-brand-gold">
        STEP {stepIndex + 1} OF {TOTAL_STEPS}
      </div>
      <h2 className="font-brand-display text-[21px] text-[#241F1B]">{title}</h2>
    </div>
  )
}

export function StepFooter({
  onBack,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled = false,
  continueType = 'button',
  formId,
  note,
}) {
  return (
    <div className="mt-auto flex flex-col gap-3 pt-2">
      {note && <p className="text-center text-[10.5px] text-[#8A7A6C]">{note}</p>}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 text-[12px] tracking-[.02em] text-[#5C4F44] underline-offset-2 hover:underline"
          >
            ← Back
          </button>
        )}
        <button
          type={continueType}
          form={formId}
          onClick={continueType === 'button' ? onContinue : undefined}
          disabled={continueDisabled}
          className="flex-1 bg-brand-navy px-4 py-4 text-center text-[12.5px] tracking-[.04em] text-brand-cream transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {continueLabel}
        </button>
      </div>
    </div>
  )
}
