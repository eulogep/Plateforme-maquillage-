// Pure slot-generation math — no Date objects, no timezone concerns, no I/O.
// Shared by the mock (src/booking/mockAvailability.js) and real
// (src/booking/availability.js) implementations so the arithmetic exists in
// exactly one place and can be unit tested in isolation.

export function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Computes bookable start times (as "HH:MM" strings) for one day.
 *
 * @param {object} params
 * @param {string} params.openTime - "HH:MM", business open time that day
 * @param {string} params.closeTime - "HH:MM", business close time that day
 * @param {number} params.durationMinutes - length of the service being booked
 * @param {number} [params.bufferMinutes=0] - gap required after each existing appointment
 * @param {{start:number,end:number}[]} [params.busyRanges=[]] - existing appointments, in minutes-since-midnight, unbuffered
 * @param {number} [params.slotIntervalMinutes=30] - granularity of slot start times
 * @param {boolean} [params.isToday=false] - whether this day is "today" in the business timezone
 * @param {number} [params.nowMinutes=0] - current time in minutes-since-midnight, business timezone (only used if isToday)
 * @returns {string[]}
 */
export function computeAvailableSlots({
  openTime,
  closeTime,
  durationMinutes,
  bufferMinutes = 0,
  busyRanges = [],
  slotIntervalMinutes = 30,
  isToday = false,
  nowMinutes = 0,
}) {
  if (!openTime || !closeTime) return []

  const openMin = timeToMinutes(openTime)
  const closeMin = timeToMinutes(closeTime)
  const bufferedRanges = busyRanges.map((r) => ({ start: r.start, end: r.end + bufferMinutes }))

  const slots = []
  for (let start = openMin; start + durationMinutes <= closeMin; start += slotIntervalMinutes) {
    const end = start + durationMinutes
    if (isToday && start <= nowMinutes) continue

    const overlapsExisting = bufferedRanges.some((r) => start < r.end && end > r.start)
    if (overlapsExisting) continue

    slots.push(minutesToTime(start))
  }

  return slots
}
