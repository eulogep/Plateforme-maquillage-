// Zod validation schemas for the booking flow. Kept separate from the UI so
// validation rules aren't duplicated across step components and can be
// reused server-side later (Milestone 5+) when booking confirmation moves
// behind a real API.
import { z } from 'zod'

// Step 3 — Client Details
export const clientDetailsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Please enter your full name'),
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email')
    .email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number')
    .max(20, 'Enter a valid phone number'),
  occasion: z.string().trim().max(120, 'Keep this under 120 characters').optional().or(z.literal('')),
  notes: z.string().trim().max(500, 'Keep this under 500 characters').optional().or(z.literal('')),
  // File input is validated for type/size here; kept optional since an
  // inspiration photo is a nice-to-have, not a booking requirement.
  inspirationPhoto: z
    .any()
    .optional()
    .refine(
      (file) => !file || typeof File === 'undefined' || !(file instanceof File) || file.size <= 8 * 1024 * 1024,
      'Photo must be 8MB or smaller'
    )
    .refine(
      (file) =>
        !file ||
        typeof File === 'undefined' ||
        !(file instanceof File) ||
        ['image/jpeg', 'image/png', 'image/webp', 'image/heic'].includes(file.type),
      'Please upload a JPEG, PNG, WEBP, or HEIC image'
    ),
})

export const clientDetailsDefaultValues = {
  fullName: '',
  email: '',
  phone: '',
  occasion: '',
  notes: '',
  inspirationPhoto: undefined,
}

// Step 1 — Service selection (not a form; just needs a chosen id)
export const serviceSelectionSchema = z.object({
  serviceId: z.string().min(1, 'Please choose a service'),
})

// Step 2 — Date & time
export const dateTimeSchema = z.object({
  date: z.date({ required_error: 'Please choose a date' }),
  time: z.string().min(1, 'Please choose a time'),
})

// Step 4 — Review + Policies
export const policiesAcknowledgementSchema = z.object({
  policiesAccepted: z
    .boolean()
    .refine((value) => value === true, 'Please confirm you have read the booking policies'),
})

// Step 5 — Payment (UI-only selection; no real charge is made yet)
export const paymentSelectionSchema = z.object({
  paymentMethod: z.string().min(1, 'Please choose a payment method'),
})
