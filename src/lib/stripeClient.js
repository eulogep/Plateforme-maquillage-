// Stripe.js client — loaded lazily, once. Only ever holds the publishable
// key (safe to expose client-side); the secret key lives only in the
// create-payment-intent / stripe-webhook Edge Functions' server environment.
//
// TEST MODE ONLY for this milestone: VITE_STRIPE_PUBLISHABLE_KEY must be a
// pk_test_... key. Nothing in this file enables live payments — that's
// entirely a function of which key is configured.
import { loadStripe } from '@stripe/stripe-js'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

export const isStripeConfigured = Boolean(publishableKey)

// loadStripe() is safe to call once and reuse — it caches the same promise.
export const stripePromise = isStripeConfigured ? loadStripe(publishableKey) : null
