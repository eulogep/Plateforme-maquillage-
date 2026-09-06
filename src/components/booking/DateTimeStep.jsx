import { useEffect, useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { isDateAvailableSync, getAvailableTimeSlots } from '@/booking/mockAvailability'
import { formatTimeLabel, parseDurationMinutes } from '@/booking/bookingUtils'
import { StepHeader, StepFooter } from './StepChrome'

// Step 2 — Date & Time. Availability comes from the mock booking domain
// layer (src/booking/mockAvailability.js), never hardcoded here, so a real
// Supabase-backed version can be swapped in without touching this component.
const DateTimeStep = ({ serviceDuration, date, time, onChangeDate, onChangeTime, onBack, onContinue }) => {
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

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
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={(d) => !isDateAvailableSync(d)}
          classNames={{
            day_selected:
              'bg-brand-navy text-brand-cream hover:bg-brand-navy hover:text-brand-cream focus:bg-brand-navy focus:text-brand-cream',
            day_today: 'border border-brand-gold text-[#241F1B]',
          }}
        />
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
