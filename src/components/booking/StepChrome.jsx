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
      {/* Champagne is too light to carry small text on ivory, so the step
          label uses the deep gold step (~4.8:1) instead. */}
      <div className="mb-1.5 text-[10px] tracking-[.14em] text-brand-gold-deep uppercase">
        Step {stepIndex + 1} of {TOTAL_STEPS}
      </div>
      <h2 className="font-brand-display text-[21px] text-brand-text">{title}</h2>
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
      {note && <p className="text-center text-[10.5px] text-brand-text-faint">{note}</p>}
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 py-2 text-[12px] tracking-[.02em] text-brand-text-muted underline-offset-2 hover:underline"
          >
            ← Back
          </button>
        )}
        <button
          type={continueType}
          form={formId}
          onClick={continueType === 'button' ? onContinue : undefined}
          disabled={continueDisabled}
          className="flex-1 bg-brand-black px-4 py-4 text-center text-[12px] tracking-[.1em] text-brand-champagne uppercase transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {continueLabel}
        </button>
      </div>
    </div>
  )
}
