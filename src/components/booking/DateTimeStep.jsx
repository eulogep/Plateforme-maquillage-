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
const DateTimeStep = ({ serviceDuration, date, time, onChangeDate, onChangeTime, onBack, onContinue }) => {
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

      <div className="flex justify-center">
        {loadingContext ? (
          <p className="py-8 text-[11.5px] text-[#8A7A6C]">Loading availability…</p>
        ) : (
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(d) => !isDateAvailableFromContext(d, context)}
            classNames={{
              day_selected:
                'bg-brand-navy text-brand-cream hover:bg-brand-navy hover:text-brand-cream focus:bg-brand-navy focus:text-brand-cream',
              day_today: 'border border-brand-gold text-[#241F1B]',
            }}
          />
        )}
      </div>

      {date && (
        <div>
          <div className="mb-2 text-[11px] text-[#8A7A6C]">
            Available times · {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          {loadingSlots ? (
            <p className="text-[11.5px] text-[#8A7A6C]">Checking availability…</p>
          ) : slots.length === 0 ? (
            <p className="text-[11.5px] text-[#8A7A6C]">No times available this day — try another date.</p>
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
                    className="p-2.5 text-center text-[11px] transition-colors"
                    style={{
                      border: isSelected ? '1.5px solid #1F2B47' : '1px solid rgba(36,31,27,.15)',
                      background: isSelected ? '#E4CFC0' : 'transparent',
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
