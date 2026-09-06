// Supabase Edge Function: stripe-webhook
//
// The ONLY place an appointment is ever transitioned to 'confirmed'. Never
// trusts a client-side redirect, callback, or query-string status — only a
// signature-verified Stripe event reaches this code at all. Not invoked by
// the browser; no CORS handling needed (Stripe calls this server-to-server).
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { AppError, extractAppointmentId, decideSucceededOutcome, decideFailureOutcome } from './logic.js'
import { isHoldExpired } from '../_shared/holdLifecycle.js'

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

async function recordPaymentException(supabaseAdmin, { appointmentId, paymentIntentId, eventId, reason, amountCents }) {
  const { error } = await supabaseAdmin.from('payment_exceptions').insert({
    appointment_id: appointmentId,
    stripe_payment_intent_id: paymentIntentId,
    stripe_event_id: eventId,
    reason,
    amount_cents: amountCents,
  })
  if (error) console.error('failed to record payment exception', error, { appointmentId, reason })
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return jsonResponse(405, { error: { code: 'INVALID_INPUT', message: 'Method not allowed' } })
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2025-02-24.acacia' })
  const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  })

  // Signature verification needs the RAW request body — never JSON-parse
  // before this, or the signature check will fail.
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

  let event
  try {
    // constructEventAsync (rather than the sync constructEvent) is
    // Stripe's documented approach for edge runtimes like Deno, which
    // don't expose Node's crypto module the same way.
    event = await stripe.webhooks.constructEventAsync(rawBody, signature ?? '', webhookSecret)
  } catch (err) {
    console.error('stripe webhook signature verification failed', err)
    return jsonResponse(400, { error: { code: 'INVALID_INPUT', message: 'Invalid signature' } })
  }

  try {
    // --- Idempotency gate: insert-if-not-exists on the event id. If this
    //     event was already processed, ack without reprocessing. This is
    //     itself race-safe (a unique constraint, not a check-then-insert)
    //     — two near-simultaneous deliveries of the same event can't both
    //     pass this gate. ---
    const { data: inserted, error: dedupeError } = await supabaseAdmin
      .from('stripe_events')
      .insert({ id: event.id, type: event.type })
      .select('id')
      .maybeSingle()
    if (dedupeError) {
      if (dedupeError.code === '23505') {
        return jsonResponse(200, { received: true, deduped: true })
      }
      throw dedupeError
    }
    if (!inserted) {
      return jsonResponse(200, { received: true, deduped: true })
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      const appointmentId = extractAppointmentId(paymentIntent)

      if (!appointmentId) {
        console.error('payment_intent.succeeded with no appointment_id metadata', paymentIntent.id)
        await recordPaymentException(supabaseAdmin, {
          appointmentId: null,
          paymentIntentId: paymentIntent.id,
          eventId: event.id,
          reason: 'missing_appointment_metadata',
          amountCents: paymentIntent.amount_received ?? paymentIntent.amount,
        })
        return jsonResponse(200, { received: true })
      }

      const { data: appointment, error: apptError } = await supabaseAdmin
        .from('appointments')
        .select('id,status,amount_due_now_cents,hold_expires_at')
        .eq('id', appointmentId)
        .maybeSingle()
      if (apptError) throw apptError

      const decision = decideSucceededOutcome({
        appointment,
        paidAmountCents: paymentIntent.amount_received ?? paymentIntent.amount,
        isHoldExpired: (holdExpiresAt) => isHoldExpired(holdExpiresAt),
      })

      if (decision.action === 'confirm') {
        const { error: confirmError } = await supabaseAdmin
          .from('appointments')
          .update({ status: 'confirmed', payment_status: 'succeeded' })
          .eq('id', appointmentId)
          .eq('status', 'payment_pending')
        if (confirmError) throw confirmError
      } else if (decision.action === 'record_exception') {
        await recordPaymentException(supabaseAdmin, {
          appointmentId,
          paymentIntentId: paymentIntent.id,
          eventId: event.id,
          reason: decision.reason,
          amountCents: paymentIntent.amount_received ?? paymentIntent.amount,
        })
      }
      // 'noop' (already confirmed): nothing to do.
    } else if (event.type === 'payment_intent.payment_failed' || event.type === 'payment_intent.canceled') {
      const paymentIntent = event.data.object
      const appointmentId = extractAppointmentId(paymentIntent)
      if (appointmentId) {
        const { data: appointment, error: apptError } = await supabaseAdmin
          .from('appointments')
          .select('id,status')
          .eq('id', appointmentId)
          .maybeSingle()
        if (apptError) throw apptError

        const newPaymentStatus = event.type === 'payment_intent.canceled' ? 'canceled' : 'failed'
        const decision = decideFailureOutcome({ appointment, newPaymentStatus })
        if (decision.action === 'update_payment_status') {
          const { error: updateError } = await supabaseAdmin
            .from('appointments')
            .update({ payment_status: decision.newPaymentStatus })
            .eq('id', appointmentId)
            .eq('status', 'payment_pending')
          if (updateError) throw updateError
        }
      }
    }
    // Every other event type: acknowledged, not acted on.

    return jsonResponse(200, { received: true })
  } catch (err) {
    if (err instanceof AppError) {
      // Still 200 to Stripe — an AppError here means "we understood the
      // event but couldn't safely apply it", which is already recorded as
      // a payment exception above; retrying won't help.
      console.error('stripe-webhook AppError', err.code, err.message)
      return jsonResponse(200, { received: true })
    }
    console.error('stripe-webhook internal error', err)
    // 500 here DOES tell Stripe to retry — appropriate for a transient
    // DB/network failure, unlike a logic-level AppError above.
    return jsonResponse(500, { error: { code: 'INTERNAL_ERROR', message: 'Internal error' } })
  }
})
