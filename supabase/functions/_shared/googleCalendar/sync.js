// Google Calendar sync — the I/O half (OAuth token refresh + Calendar API
// call + calendar_events bookkeeping). Only runs if all four env values
// are present (isGoogleCalendarConfigured); otherwise this is a documented
// no-op, never a blocking error, since Google credentials are optional
// for this milestone (see the Milestone 6 report for exact setup needed).
//
// Auth model: a single Google account (Emmanuelle's business calendar)
// authorized ONCE via the standard OAuth "installed app"/"web app" flow to
// obtain a long-lived refresh token, stored server-side only
// (GOOGLE_REFRESH_TOKEN). No customer-facing OAuth — this app never asks a
// client to sign in with Google. Each sync call exchanges the refresh
// token for a short-lived access token, then creates the event.
import { isGoogleCalendarConfigured, buildCalendarEventPayload, decideCalendarSyncAction } from './payload.js'

async function getAccessToken({ clientId, clientSecret, refreshToken }) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.error_description ?? data?.error ?? 'Failed to refresh Google access token')
  }
  return data.access_token
}

/**
 * Creates (idempotently) a Google Calendar event for a confirmed
 * appointment. Never throws — always returns a result object; callers
 * (stripe-webhook) must not let a calendar-sync failure affect the
 * booking/payment outcome, same posture as email notifications.
 *
 * @param {object} params
 * @param {object} params.supabaseAdmin
 * @param {string} params.appointmentId
 * @param {{clientId, clientSecret, refreshToken, calendarId}} params.env
 * @param {object} params.eventContext - passed to buildCalendarEventPayload
 */
export async function syncConfirmedAppointmentToGoogleCalendar({ supabaseAdmin, appointmentId, env, eventContext }) {
  if (!isGoogleCalendarConfigured(env)) {
    return { action: 'skipped', reason: 'not_configured' }
  }

  try {
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('calendar_events')
      .select('id,status')
      .eq('appointment_id', appointmentId)
      .maybeSingle()
    if (fetchError) throw fetchError

    if (decideCalendarSyncAction(existing) === 'skip') {
      return { action: 'skipped', reason: 'already_created' }
    }

    const accessToken = await getAccessToken(env)
    const payload = buildCalendarEventPayload(eventContext)

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(env.calendarId)}/events`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(data?.error?.message ?? `Google Calendar API error (HTTP ${response.status})`)
    }

    await upsertCalendarEvent(supabaseAdmin, appointmentId, existing, {
      status: 'created',
      external_event_id: data.id,
      external_calendar_id: env.calendarId,
    })
    return { action: 'created', eventId: data.id }
  } catch (err) {
    console.error('Google Calendar sync failed', appointmentId, err)
    await upsertCalendarEvent(supabaseAdmin, appointmentId, null, {
      status: 'failed',
      last_error: err?.message ?? 'unknown error',
    }).catch(() => {})
    return { action: 'failed', reason: err?.message }
  }
}

async function upsertCalendarEvent(supabaseAdmin, appointmentId, existing, patch) {
  const row = { ...patch, updated_at: new Date().toISOString() }
  if (existing) {
    const { error } = await supabaseAdmin.from('calendar_events').update(row).eq('id', existing.id)
    if (error) console.error('failed to update calendar_events', error)
  } else {
    const { error } = await supabaseAdmin.from('calendar_events').insert({ appointment_id: appointmentId, ...row })
    if (error) console.error('failed to insert calendar_events', error)
  }
}
