// Dedicated Supabase client layer. Everything that talks to Supabase goes
// through here — no other file should call createClient() directly.
//
// This intentionally tolerates missing configuration: no real Supabase
// project is connected yet in every environment (e.g. local development
// without a .env), so `isSupabaseConfigured` lets callers fall back to mock
// data instead of crashing. See src/booking/availability.js.
import { createClient } from '@supabase/supabase-js'

// Exported (not just used internally) so src/booking/bookingApi.js can build
// the Edge Function URL and auth header without a second source of truth.
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Only ever holds the anon/public key — this file must never import or
// reference a service-role key. Service-role-authenticated access lives
// only in supabase/functions/create-booking (an Edge Function), never in
// client code.
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null
