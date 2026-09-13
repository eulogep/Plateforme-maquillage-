// Appointment status lifecycle — mirrors the `appointments_status_check`
// constraint in supabase/migrations/20260907100001_booking_creation_constraints.sql.
// Only the server (create-booking Edge Function) ever sets a status; the
// client only ever displays one it received back.
//
//   pending          -> booking request received; no payment step exists
//                       yet, so this is the only status this app can
//                       currently produce.
//   payment_pending  -> a deposit/payment attempt has been initiated
//                       (introduced once Stripe is wired up).
//   confirmed        -> payment succeeded / deposit collected.
//   completed        -> the appointment took place.
//   cancelled        -> cancelled by the client or Emmanuelle.
//   expired          -> never moved past pending/payment_pending in time.
//   no_show          -> client did not show up.
//
// Only pending/payment_pending/confirmed occupy a calendar slot (see the
// database exclusion constraint) — every other status frees it.
export const APPOINTMENT_STATUSES = {
  pending: {
    label: 'Request received',
    description:
      "Your booking request has been received. Payment isn't collected yet, so this isn't confirmed until that's set up.",
  },
  payment_pending: {
    label: 'Payment pending',
    description: 'A payment attempt is in progress for this booking.',
  },
  confirmed: {
    label: 'Confirmed',
    description: "You're booked.",
  },
  completed: {
    label: 'Completed',
    description: 'This appointment has taken place.',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'This booking was cancelled.',
  },
  expired: {
    label: 'Expired',
    description: 'This booking request expired before it was completed.',
  },
  no_show: {
    label: 'No-show',
    description: 'The client did not show up for this appointment.',
  },
}

export function describeStatus(status) {
  return APPOINTMENT_STATUSES[status] ?? { label: status ?? 'Unknown', description: '' }
}
