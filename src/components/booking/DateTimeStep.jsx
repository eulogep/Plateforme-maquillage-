import { useEffect, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { loadAvailabilityContext, isDateAvailableFromContext, getAvailableTimeSlots } from '@/booking/availability'
import { formatTimeLabel, parseDurationMinutes } from '@/booking/bookingUtils'
import { StepHeader, StepFooter } from './StepChrome'

// Step 2 — Date & Time. Availability comes from the booking domain layer
// (src/booking/availability.js — real Supabase queries, falling back to
// src/booking/mockAvailability.js when Supabase isn't configured), never
// hardcoded here.
//
// The weekly schedule + blocked dates are fetched once on mount into
// `context` so the calendar's day-disabling can stay a synchronous check
// (react-day-picker's `disabled` matcher can't be async) while still being
// backed by real data. Time slots for the chosen date are fetched async, as
// before.
const DateTimeStep = ({
  serviceDuration,
  date,
  time,
  slotUnavailableNotice,
  onChangeDate,
  onChangeTime,
  onBack,
  onContinue,
}) => {
  const [context, setContext] = useState(null)
  const [loadingContext, setLoadingContext] = useState(true)
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadAvailabilityContext().then((result) => {
      if (!cancelled) {
        setContext(result)
        setLoadingContext(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!date) {
      setSlots([])
      return
    }
    let cancelled = false
    setLoadingSlots(true)
    getAvailableTimeSlots(date, parseDurationMinutes(serviceDuration)).then((result) => {
      if (!cancelled) {
        setSlots(result)
        setLoadingSlots(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [date, serviceDuration])

  const handleDateSelect = (nextDate) => {
    onChangeDate(nextDate)
    onChangeTime('')
  }

  return (
    <div className="flex min-h-[70vh] flex-col gap-4 p-6 lg:p-7">
      <StepHeader stepIndex={1} title="When works for you?" />

      {slotUnavailableNotice && (
        <p
          role="status"
          className="border border-brand-danger/30 bg-brand-danger/5 p-2.5 text-[11.5px] text-brand-danger-deep"
        >
          {slotUnavailableNotice}
        </p>
      )}

      <div className="flex justify-center">
        {loadingContext ? (
          <p className="py-8 text-[11.5px] text-brand-text-faint">Loading availability…</p>
        ) : (
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(d) => !isDateAvailableFromContext(d, context)}
            classNames={{
              // Selected day: deep black ground with champagne type — gold
              // on the ivory calendar would be far too low-contrast to
              // carry a date number.
              day_selected:
                'bg-brand-black text-brand-champagne hover:bg-brand-black hover:text-brand-champagne focus:bg-brand-black focus:text-brand-champagne',
              day_today: 'border border-brand-gold text-brand-text',
            }}
          />
        )}
      </div>

      {date && (
        <div>
          <div className="mb-2 text-[10.5px] tracking-[.12em] text-brand-gold-deep uppercase">
            Available times · {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          {loadingSlots ? (
            <p className="text-[11.5px] text-brand-text-faint">Checking availability…</p>
          ) : slots.length === 0 ? (
            <p className="text-[11.5px] text-brand-text-faint">
              No times available this day — try another date.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => {
                const isSelected = time === slot
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onChangeTime(slot)}
                    aria-pressed={isSelected}
                    // Selected slots change ground *and* weight, so the
                    // champagne edge is never the only signal.
                    className={`p-2.5 text-center text-[11px] transition-colors ${
                      isSelected
                        ? 'bg-brand-powder-pink font-medium text-brand-text'
                        : 'bg-transparent text-brand-text-muted hover:bg-brand-ivory-soft'
                    }`}
                    style={{
                      border: isSelected
                        ? '1.5px solid var(--brand-champagne)'
                        : '1px solid var(--brand-rule)',
                    }}
                  >
                    {formatTimeLabel(slot)}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      <StepFooter onBack={onBack} onContinue={onContinue} continueDisabled={!date || !time} />
    </div>
  )
}

export default DateTimeStep
