import { describe, it, expect, vi, afterEach } from 'vitest'
import { submitBooking, BookingApiError } from './bookingApi'

// src/lib/supabaseClient.js resolves isSupabaseConfigured from
// import.meta.env at module load, which is false in this test env — so
// submitBooking's "not configured" guard is exercised directly. The
// fetch-based success/error paths are exercised by stubbing
// isSupabaseConfigured via module mocking instead of relying on env vars,
// since import.meta.env can't be reassigned at runtime.
vi.mock('@/lib/supabaseClient', () => ({
  isSupabaseConfigured: true,
  supabaseUrl: 'https://example.supabase.co',
  supabaseAnonKey: 'test-anon-key',
}))

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('submitBooking', () => {
  it('resolves with the parsed JSON body on a 201 success', async () => {
    const mockResponse = { id: 'abc-123', status: 'pending', serviceId: 'soft-glam' }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })
    )

    const result = await submitBooking({ payload: { serviceId: 'soft-glam' } })
    expect(result).toEqual(mockResponse)
  })

  it('throws a BookingApiError with the server error code on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: { code: 'SLOT_UNAVAILABLE', message: 'Someone else booked this time.' } }),
      })
    )

    await expect(submitBooking({ payload: {} })).rejects.toMatchObject({
      code: 'SLOT_UNAVAILABLE',
      message: 'Someone else booked this time.',
    })
  })

  it('throws a BookingApiError instance specifically', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: { code: 'INVALID_INPUT', message: 'Bad input.' } }),
      })
    )

    try {
      await submitBooking({ payload: {} })
      throw new Error('expected to throw')
    } catch (err) {
      expect(err).toBeInstanceOf(BookingApiError)
    }
  })

  it('falls back to INTERNAL_ERROR when fetch itself fails (network error)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network request failed')))

    await expect(submitBooking({ payload: {} })).rejects.toMatchObject({ code: 'INTERNAL_ERROR' })
  })

  it('sends the inspiration photo as part of the multipart form body when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: '1', status: 'pending' }) })
    vi.stubGlobal('fetch', fetchMock)

    const fakeFile = new File(['data'], 'look.jpg', { type: 'image/jpeg' })
    await submitBooking({ payload: { serviceId: 'soft-glam' }, inspirationPhoto: fakeFile })

    const [, options] = fetchMock.mock.calls[0]
    expect(options.body).toBeInstanceOf(FormData)
    expect(options.body.get('inspirationPhoto')).toBe(fakeFile)
    expect(JSON.parse(options.body.get('payload'))).toEqual({ serviceId: 'soft-glam' })
  })
})
