// Supabase Edge Function: create-booking
//
// This is the ONLY place an appointment is ever written. The client never
// writes to `customers` or `appointments` directly (both have RLS enabled
// with zero anon/authenticated policies — see the Milestone 4A/4B
// migrations). This function runs server-side with the service-role key,
// which is never exposed to the client (it's not a VITE_* variable and is
// only ever read from Deno.env here).
//
// Deployed and live-tested against a real Supabase project as of
// Milestone 4C — see INTEGRATION_TESTING.md.
import { createClient } from '@supabase/supabase-js'
import {
  AppError,
  validateBookingPayload,
  validatePhotoMetadata,
  computeBookingWindow,
  hashPayload,
  mapDatabaseError,
  resolveAllowedOrigin,
} from './logic.js'
import { expireStaleHolds, computeHoldExpiresAt, resolveHoldDurationMinutes } from '../_shared/holdLifecycle.js'

// Business timezone, duplicated intentionally from src/config/business.js —
// this Deno function can't import across the Vite "@/" alias boundary. See
// that file for why this is a geographic fact, not a placeholder.
const BUSINESS_TIMEZONE = 'America/New_York'

// CORS: the request's Origin is only ever reflected back if it's on the
// allow-list (see resolveAllowedOrigin) — local dev origins are always
// allowed; the production domain is added via the ALLOWED_ORIGINS secret
// (comma-separated) once one exists:
//   supabase secrets set ALLOWED_ORIGINS=https://emmanuellesingani.com
// There is deliberately no unrestricted '*' anywhere in this file.
function corsHeaders(requestOrigin) {
  const allowOrigin = resolveAllowedOrigin(requestOrigin, Deno.env.get('ALLOWED_ORIGINS') ?? '')
  return {
    ...(allowOrigin ? { 'Access-Control-Allow-Origin': allowOrigin, Vary: 'Origin' } : {}),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

function jsonResponse(status, body, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

function errorResponse(status, code, message, details, cors) {
  return jsonResponse(status, { error: { code, message, details } }, cors)
}

const ERROR_STATUS = {
  INVALID_INPUT: 422,
  INVALID_SERVICE: 422,
  BLOCKED_DATE: 422,
  OUTSIDE_BUSINESS_HOURS: 422,
  SLOT_UNAVAILABLE: 409,
  DUPLICATE_REQUEST: 409,
  INTERNAL_ERROR: 500,
}

function todayInBusinessTimezone() {
  // en-CA formats as YYYY-MM-DD, which is exactly what we need to compare
  // against the submitted date string.
  return new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIMEZONE }).format(new Date())
}

function weekdayOfDateString(dateStr) {
  // A calendar date's day-of-week does not depend on timezone, so parsing
  // as UTC midnight is safe and avoids any local-runtime-timezone bugs.
  return new Date(`${dateStr}T00:00:00Z`).getUTCDay()
}

function toPublicAppointment(row) {
  return {
    id: row.id,
    status: row.status,
    serviceId: row.service_id,
    date: row.appointment_date,
    startTime: typeof row.start_time === 'string' ? row.start_time.slice(0, 5) : row.start_time,
    endTime: typeof row.end_time === 'string' ? row.end_time.slice(0, 5) : row.end_time,
    holdExpiresAt: row.hold_expires_at ?? null,
  }
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req.headers.get('Origin'))

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }
  if (req.method !== 'POST') {
    return errorResponse(405, 'INVALID_INPUT', 'Method not allowed', undefined, cors)
  }

  const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  })

  try {
    // --- 1. Parse + validate input (never trust price/duration/end time/
    //        deposit/status from the client — those fields are never even
    //        read here) ---
    const formData = await req.formData()
    const rawPayload = formData.get('payload')
    let parsedPayload
    try {
      parsedPayload = JSON.parse(typeof rawPayload === 'string' ? rawPayload : '')
    } catch {
      throw new AppError('INVALID_INPUT', 'payload must be valid JSON')
    }
    const payload = validateBookingPayload(parsedPayload)

    const photoFile = formData.get('inspirationPhoto')
    const photoMeta =
      photoFile && typeof photoFile === 'object' && 'arrayBuffer' in photoFile
        ? validatePhotoMetadata({ type: photoFile.type, size: photoFile.size, name: photoFile.name })
        : null

    if (payload.date < todayInBusinessTimezone()) {
      throw new AppError('INVALID_INPUT', 'Cannot book a date in the past', { field: 'date' })
    }

    const requestHash = hashPayload(payload)

    // --- Sweep any stale holds before checking availability, so a slot
    //     abandoned by a previous unpaid attempt is actually free again
    //     (see Milestone 5 — the exclusion constraint can't expire holds
    //     on its own since its predicate can't reference now()). ---
    await expireStaleHolds(supabaseAdmin)

    // --- 2. Idempotency: same key + same payload -> return the original
    //        result rather than creating a duplicate. Same key + different
    //        payload -> reject as a client bug. ---
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('appointments')
      .select('id,status,service_id,appointment_date,start_time,end_time,hold_expires_at,request_payload_hash')
      .eq('idempotency_key', payload.idempotencyKey)
      .maybeSingle()
    if (existingError) throw existingError

    if (existing) {
      if (existing.request_payload_hash === requestHash) {
        return jsonResponse(200, toPublicAppointment(existing), cors)
      }
      return errorResponse(
        ERROR_STATUS.DUPLICATE_REQUEST,
        'DUPLICATE_REQUEST',
        'This request was already used for a different booking',
        undefined,
        cors
      )
    }

    // --- 3. Re-validate availability server-side, from authoritative data
    //        (never the client's earlier view of it) ---
    const [serviceResult, ruleResult, blockedResult] = await Promise.all([
      supabaseAdmin.from('services').select('id,name,duration_minutes,active').eq('id', payload.serviceId).maybeSingle(),
      supabaseAdmin
        .from('availability_rules')
        .select('is_closed,open_time,close_time,buffer_minutes')
        .eq('weekday', weekdayOfDateString(payload.date))
        .maybeSingle(),
      supabaseAdmin.from('blocked_dates').select('blocked_date').eq('blocked_date', payload.date).maybeSingle(),
    ])
    if (serviceResult.error) throw serviceResult.error
    if (ruleResult.error) throw ruleResult.error
    if (blockedResult.error) throw blockedResult.error

    const window = computeBookingWindow({
      service: serviceResult.data,
      rule: ruleResult.data,
      isBlocked: Boolean(blockedResult.data),
      startTime: payload.startTime,
    })

    // --- 4. Resolve/upsert the customer (deduped by normalized email) ---
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .upsert(
        { full_name: payload.fullName, email: payload.email, phone: payload.phone },
        { onConflict: 'normalized_email' }
      )
      .select('id')
      .single()
    if (customerError) throw customerError

    // --- 5. Inspiration photo (optional): uploaded server-side, only the
    //        object path is stored on the appointment. A failed upload
    //        does not block the booking. ---
    const appointmentId = crypto.randomUUID()
    const holdDurationMinutes = resolveHoldDurationMinutes(Deno.env.get('HOLD_DURATION_MINUTES'))
    const holdExpiresAt = computeHoldExpiresAt(new Date(), holdDurationMinutes)
    let inspirationPhotoPath = null
    let photoWarning
    if (photoFile && photoMeta) {
      const extension = (photoMeta.name.split('.').pop() || 'jpg').toLowerCase()
      const objectPath = `${appointmentId}/${Date.now()}.${extension}`
      const { error: uploadError } = await supabaseAdmin.storage
        .from('inspiration-photos')
        .upload(objectPath, photoFile, { contentType: photoMeta.type, upsert: false })
      if (uploadError) {
        console.error('inspiration photo upload failed', uploadError)
        photoWarning = 'We could not save your inspiration photo, but your booking request was still submitted.'
      } else {
        inspirationPhotoPath = objectPath
      }
    }

    // --- 6. Insert. The exclusion constraint (appointments_no_overlap) is
    //        the actual no-double-booking guarantee — this INSERT can fail
    //        with 23P01 if a concurrent request won the same slot. ---
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('appointments')
      .insert({
        id: appointmentId,
        customer_id: customer.id,
        service_id: serviceResult.data.id,
        appointment_date: payload.date,
        start_time: payload.startTime,
        end_time: window.endTime,
        status: 'pending',
        occasion: payload.occasion || null,
        notes: payload.notes || null,
        buffer_minutes_applied: window.bufferMinutes,
        idempotency_key: payload.idempotencyKey,
        request_payload_hash: requestHash,
        inspiration_photo_path: inspirationPhotoPath,
        hold_expires_at: holdExpiresAt.toISOString(),
      })
      .select('id,status,service_id,appointment_date,start_time,end_time,hold_expires_at')
      .single()

    if (insertError) {
      const mapped = mapDatabaseError(insertError)
      if (mapped === null) {
        // Concurrent identical-idempotency-key requests both passed the
        // earlier lookup before either inserted; whoever won is the result.
        const { data: winner } = await supabaseAdmin
          .from('appointments')
          .select('id,status,service_id,appointment_date,start_time,end_time,hold_expires_at')
          .eq('idempotency_key', payload.idempotencyKey)
          .maybeSingle()
        if (winner) return jsonResponse(200, toPublicAppointment(winner), cors)
        throw insertError
      }
      throw mapped
    }

    return jsonResponse(201, { ...toPublicAppointment(inserted), photoWarning }, cors)
  } catch (err) {
    if (err instanceof AppError) {
      return errorResponse(ERROR_STATUS[err.code] ?? 500, err.code, err.message, err.details, cors)
    }
    console.error('create-booking internal error', err)
    return errorResponse(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.', undefined, cors)
  }
})
