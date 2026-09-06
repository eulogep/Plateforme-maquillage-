// Dedicated Supabase client layer. Everything that talks to Supabase goes
// through here — no other file should call createClient() directly.
//
// This intentionally tolerates missing configuration: no real Supabase
// project is connected yet in every environment (e.g. local development
// without a .env), so `isSupabaseConfigured` lets callers fall back to mock
// data instead of crashing. See src/booking/availability.js.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Only ever holds the anon/public key — this file must never import or
// reference a service-role key. Server-side, service-role-authenticated
// access is a separate concern for Milestone 4B (a serverless
// function/Edge Function), not this client-side module.
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null
