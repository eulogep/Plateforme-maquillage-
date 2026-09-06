// @ts-nocheck — plain JS (see README: the .ts extension is required by
// `supabase functions deploy`'s entrypoint convention, not because this is
// typed). Needed here specifically because the untyped supabase-js client
// infers a foreign-table embed like `customers(full_name,email)` as an
// array type regardless of the relationship's actual to-one cardinality,
// which PostgREST returns as a single object at runtime — a type/runtime
// mismatch in the library's own inference, not a real bug in this file.
// Supabase Edge Function: create-payment-intent
//
// Creates (or safely reuses) a Stripe PaymentIntent for an existing
// appointment and transitions it to 'payment_pending'. The browser never
// calculates the amount, never sees the Stripe secret key, and never marks
// anything paid/confirmed — this function returns only a client_secret,
// and only the stripe-webhook function (on a verified webhook event) ever
// sets status to 'confirmed'.
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import {
  AppError,
  validateInput,
  assertAppointmentPayable,
  shouldReuseExistingIntent,
  buildIdempotencyKey,
} from './logic.js'
import { corsHeaders } from '../_shared/cors.js'
import { expireStaleHolds, computeHoldExpiresAt, resolveHoldDurationMinutes } from '../_shared/holdLifecycle.js'
import { depositConfig, calculateDeposit } from '../_shared/depositConfig.js'
import { businessInfo } from '../_shared/businessInfo.js'
import { formatDateLabel, formatTimeLabel } from '../_shared/formatting.js'
import { sendNotification } from '../_shared/notifications/send.js'

const ERROR_STATUS = {
  INVALID_INPUT: 422,
  APPOINTMENT_NOT_FOUND: 404,
  INVALID_APPOINTMENT_STATE: 409,
  INTERNAL_ERROR: 500,
}

function jsonResponse(status, body, cors) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

function errorResponse(status, code, message, details, cors) {
  return jsonResponse(status, { error: { code, message, details } }, cors)
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req.headers.get('Origin'), Deno.env.get('ALLOWED_ORIGINS'))

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }
  if (req.method !== 'POST') {
    return errorResponse(405, 'INVALID_INPUT', 'Method not allowed', undefined, cors)
  }

  const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  })
  // TEST MODE ONLY — STRIPE_SECRET_KEY must be a sk_test_... key. This
  // function never enables live payments; which mode runs is entirely a
  // function of which key is configured server-side.
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2025-02-24.acacia' })

  try {
    const body = await req.json().catch(() => null)
    const { appointmentId } = validateInput(body)

    // Free the slot first if this appointment's hold already lapsed, so we
    // reject it below instead of reviving an expired hold.
    await expireStaleHolds(supabaseAdmin, appointmentId)

    const { data: appointment, error: apptError } = await supabaseAdmin
      .from('appointments')
      .select(
        'id,status,service_id,stripe_payment_intent_id,appointment_date,start_time,customers(full_name,email),services(name)'
      )
      .eq('id', appointmentId)
      .maybeSingle()
    if (apptError) throw apptError

    // The sweep above may have just expired THIS appointment (the customer
    // came back to pay after their hold lapsed) — that's a real, natural
    // trigger point for the (optional) booking_expired email, distinct
    // from create-booking's global multi-row sweep which doesn't have a
    // single customer to notify.
    if (appointment?.status === 'expired' && appointment.customers?.email) {
      await sendNotification({
        supabaseAdmin,
        appointmentId: appointment.id,
        notificationType: 'booking_expired',
        to: appointment.customers.email,
        resendApiKey: Deno.env.get('RESEND_API_KEY'),
        resendFrom: Deno.env.get('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev',
        templateContext: {
          businessName: businessInfo.name,
          locationLine: businessInfo.locationLine,
          contactEmail: businessInfo.contactEmail,
          contactPhone: businessInfo.contactPhone,
          customerName: appointment.customers.full_name,
          serviceName: appointment.services?.name ?? 'Appointment',
          dateLabel: formatDateLabel(appointment.appointment_date),
          timeLabel: formatTimeLabel(appointment.start_time.slice(0, 5)),
          appointmentReference: appointment.id,
        },
      })
    }

    assertAppointmentPayable(appointment)

    // --- Authoritative price: loaded server-side, never trusted from the
    //     client. ---
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('id,name,duration_minutes,price_cents,active')
      .eq('id', appointment.service_id)
      .maybeSingle()
    if (serviceError) throw serviceError
    if (!service || !service.active || service.price_cents == null) {
      throw new AppError('INVALID_APPOINTMENT_STATE', 'This service no longer has a price configured', {
        serviceId: appointment.service_id,
      })
    }

    // --- Authoritative deposit calculation. depositConfig is NOT an
    //     Emmanuelle-confirmed policy (see _shared/depositConfig.js) —
    //     whatever it currently is gets snapshotted onto the appointment
    //     below so a later config change never alters this booking. ---
    const { amountDueNowCents, remainingBalanceCents, depositType, depositValue } = calculateDeposit(
      service.price_cents,
      depositConfig
    )

    // --- Create or safely reuse the PaymentIntent. Two layers of
    //     idempotency: (1) if this appointment already has an intent that
    //     hasn't been paid/canceled, just re-fetch its client_secret
    //     rather than creating a new one; (2) even on the create path,
    //     Stripe's own idempotency key (scoped to this appointment) means
    //     two concurrent calls that both reach "no reusable intent yet"
    //     still can't create two PaymentIntents for the same booking. ---
    let clientSecret
    let paymentIntentId = appointment.stripe_payment_intent_id

    if (paymentIntentId) {
      const existingIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      if (shouldReuseExistingIntent(existingIntent.status)) {
        clientSecret = existingIntent.client_secret
      }
    }

    if (!clientSecret) {
      const intent = await stripe.paymentIntents.create(
        {
          amount: amountDueNowCents,
          currency: 'usd',
          automatic_payment_methods: { enabled: true },
          metadata: {
            appointment_id: appointment.id,
            service_id: service.id,
            environment: 'test',
          },
        },
        { idempotencyKey: buildIdempotencyKey(appointment.id) }
      )
      clientSecret = intent.client_secret
      paymentIntentId = intent.id
    }

    const holdDurationMinutes = resolveHoldDurationMinutes(Deno.env.get('HOLD_DURATION_MINUTES'))
    const holdExpiresAt = computeHoldExpiresAt(new Date(), holdDurationMinutes)

    const { error: updateError } = await supabaseAdmin
      .from('appointments')
      .update({
        status: 'payment_pending',
        payment_status: 'requires_payment',
        stripe_payment_intent_id: paymentIntentId,
        service_price_cents: service.price_cents,
        deposit_type: depositType,
        deposit_value: depositValue,
        amount_due_now_cents: amountDueNowCents,
        remaining_balance_cents: remainingBalanceCents,
        hold_expires_at: holdExpiresAt.toISOString(),
      })
      .eq('id', appointment.id)
      .in('status', ['pending', 'payment_pending'])
    if (updateError) throw updateError

    // --- Notification: fire-and-forget-but-awaited, never lets a failure
    //     here affect the successful response above. Idempotent per
    //     (appointment, type) — a retried create-payment-intent call for
    //     the same appointment won't send this twice. ---
    if (appointment.customers?.email) {
      await sendNotification({
        supabaseAdmin,
        appointmentId: appointment.id,
        notificationType: 'booking_payment_pending',
        to: appointment.customers.email,
        resendApiKey: Deno.env.get('RESEND_API_KEY'),
        resendFrom: Deno.env.get('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev',
        templateContext: {
          businessName: businessInfo.name,
          locationLine: businessInfo.locationLine,
          contactEmail: businessInfo.contactEmail,
          contactPhone: businessInfo.contactPhone,
          customerName: appointment.customers.full_name,
          serviceName: service.name,
          dateLabel: formatDateLabel(appointment.appointment_date),
          timeLabel: formatTimeLabel(appointment.start_time.slice(0, 5)),
          durationLabel: `${service.duration_minutes} min`,
          appointmentReference: appointment.id,
          amountDueNowCents,
          remainingBalanceCents,
        },
      })
    }

    return jsonResponse(
      200,
      {
        clientSecret,
        amountDueNowCents,
        remainingBalanceCents,
        currency: 'usd',
        depositType,
        depositValue,
        depositConfirmed: depositConfig.isConfirmed,
        holdExpiresAt: holdExpiresAt.toISOString(),
      },
      cors
    )
  } catch (err) {
    if (err instanceof AppError) {
      return errorResponse(ERROR_STATUS[err.code] ?? 500, err.code, err.message, err.details, cors)
    }
    console.error('create-payment-intent internal error', err)
    return errorResponse(500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.', undefined, cors)
  }
})
