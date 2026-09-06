import { useEffect, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { stripePromise, isStripeConfigured } from '@/lib/stripeClient'
import { createPaymentIntent, BookingApiError } from '@/booking/bookingApi'
import { getServiceById, formatCents } from '@/booking/bookingUtils'
import { StepHeader, StepFooter } from './StepChrome'

// Step 5 — Payment. Real Stripe Payment Element, TEST MODE ONLY (which mode
// is active depends entirely on which key is configured server/client-side
// — nothing here can enable live payments). This step:
//   1. Calls create-payment-intent once it has an appointmentId (from
//      Review's create-booking call), to get a client_secret. The amounts
//      shown are exactly what the server computed — never calculated here.
//   2. Renders Stripe's Payment Element inside <Elements>, showing only
//      the payment methods Stripe itself has enabled for this account/mode.
//   3. On submit, calls stripe.confirmPayment() and — regardless of
//      outcome shown by Stripe's own UI — hands off to Confirmation to
//      poll the server for the real, webhook-verified status. This step
//      never marks anything paid or confirmed itself.
const PaymentStep = ({ bookingData, onBack, onPaid }) => {
  const [intentState, setIntentState] = useState({ status: 'loading', data: null, errorMessage: null })

  useEffect(() => {
    let cancelled = false
    if (!bookingData.appointmentId) {
      setIntentState({ status: 'error', data: null, errorMessage: 'Missing booking reference — please start over.' })
      return
    }
    setIntentState({ status: 'loading', data: null, errorMessage: null })
    createPaymentIntent(bookingData.appointmentId)
      .then((data) => {
        if (!cancelled) setIntentState({ status: 'ready', data, errorMessage: null })
      })
      .catch((err) => {
        if (cancelled) return
        const message = err instanceof BookingApiError ? err.message : 'Could not start payment. Please try again.'
        setIntentState({ status: 'error', data: null, errorMessage: message })
      })
    return () => {
      cancelled = true
    }
  }, [bookingData.appointmentId])

  const service = getServiceById(bookingData.serviceId)

  if (!isStripeConfigured) {
    return (
      <div className="flex min-h-[70vh] flex-col gap-3.5 p-6 lg:p-7">
        <StepHeader stepIndex={4} title="Secure your slot" />
        <p className="border border-[#B23B3B]/30 bg-[#B23B3B]/5 p-2.5 text-[11.5px] text-[#8A2E2E]">
          Payment isn't connected in this environment yet.
        </p>
        <StepFooter onBack={onBack} onContinue={() => {}} continueLabel="Continue" continueDisabled />
      </div>
    )
  }

  if (intentState.status === 'loading') {
    return (
      <div className="flex min-h-[70vh] flex-col gap-3.5 p-6 lg:p-7">
        <StepHeader stepIndex={4} title="Secure your slot" />
        <p className="text-[11.5px] text-[#8A7A6C]">Preparing payment…</p>
        <StepFooter onBack={onBack} onContinue={() => {}} continueLabel="Continue" continueDisabled />
      </div>
    )
  }

  if (intentState.status === 'error') {
    return (
      <div className="flex min-h-[70vh] flex-col gap-3.5 p-6 lg:p-7">
        <StepHeader stepIndex={4} title="Secure your slot" />
        <p className="border border-[#B23B3B]/30 bg-[#B23B3B]/5 p-2.5 text-[11.5px] text-[#8A2E2E]">
          {intentState.errorMessage}
        </p>
        <StepFooter onBack={onBack} onContinue={() => {}} continueLabel="Continue" continueDisabled />
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret: intentState.data.clientSecret, appearance: STRIPE_APPEARANCE }}>
      <PaymentForm service={service} intentData={intentState.data} onBack={onBack} onPaid={onPaid} />
    </Elements>
  )
}

// Restyles Stripe's default Payment Element to sit within the approved
// design's palette/typography rather than its default look.
const STRIPE_APPEARANCE = {
  variables: {
    colorPrimary: '#1F2B47',
    colorText: '#241F1B',
    colorTextPlaceholder: '#A99788',
    fontFamily: 'Jost, sans-serif',
    borderRadius: '0px',
    fontSizeBase: '13px',
  },
}

function PaymentForm({ service, intentData, onBack, onPaid }) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitState, setSubmitState] = useState({ status: 'idle', errorMessage: null })

  const handlePay = async () => {
    if (!stripe || !elements) return
    setSubmitState({ status: 'submitting', errorMessage: null })

    const { error } = await stripe.confirmPayment({
      elements,
      // Only used if a payment method genuinely requires leaving the page
      // (redirect: 'if_required' below avoids that for anything that doesn't).
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    })

    if (error) {
      // Card declined, authentication failed, network error, etc. — Stripe
      // gives a human-readable message; the client details/form state are
      // untouched, so the user can just try again.
      setSubmitState({ status: 'error', errorMessage: error.message ?? 'Payment could not be completed.' })
      return
    }

    // No client-side error does NOT mean confirmed — only the verified
    // Stripe webhook sets status to 'confirmed'. Hand off to Confirmation,
    // which polls the server for the real state.
    onPaid()
  }

  return (
    <div className="flex min-h-[70vh] flex-col gap-3.5 p-6 lg:p-7">
      <StepHeader stepIndex={4} title="Secure your slot" />

      {submitState.status === 'error' && (
        <p className="border border-[#B23B3B]/30 bg-[#B23B3B]/5 p-2.5 text-[11.5px] text-[#8A2E2E]">
          {submitState.errorMessage}
        </p>
      )}

      <div className="flex flex-col gap-2 border border-[#241F1B]/[.08] bg-brand-cream-soft p-4 text-[12.5px] text-[#4A3E35]">
        <div className="flex justify-between">
          <span>{service?.name ?? 'Service'} total</span>
          <span>{formatCents(intentData.amountDueNowCents + intentData.remainingBalanceCents)}</span>
        </div>
        <div className="flex justify-between">
          <span>Deposit due now</span>
          <span className="text-right">{formatCents(intentData.amountDueNowCents)}</span>
        </div>
        <div className="flex justify-between text-[#8A7A6C]">
          <span>Remaining balance</span>
          <span className="text-right">{formatCents(intentData.remainingBalanceCents)}, due at appointment</span>
        </div>
        {!intentData.depositConfirmed && (
          <div className="mt-1 text-[10.5px] text-[#A99788]">
            Deposit structure is a development placeholder, pending Emmanuelle's confirmation.
          </div>
        )}
      </div>

      <div className="text-[11px] tracking-[.06em] text-[#8A7A6C] uppercase">Payment method</div>
      <PaymentElement />

      <StepFooter
        onBack={onBack}
        onContinue={handlePay}
        continueLabel={submitState.status === 'submitting' ? 'Processing…' : 'Pay & confirm'}
        continueDisabled={submitState.status === 'submitting' || !stripe || !elements}
        note="🔒 Test mode — no real charge is made. Payments are processed securely by Stripe."
      />
    </div>
  )
}

export default PaymentStep
