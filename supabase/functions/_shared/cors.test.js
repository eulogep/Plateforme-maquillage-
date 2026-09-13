import { describe, it, expect } from 'vitest'
import { resolveAllowedOrigin, corsHeaders } from './cors.js'

describe('resolveAllowedOrigin', () => {
  it('allows the default dev origin', () => {
    expect(resolveAllowedOrigin('http://localhost:5173', '')).toBe('http://localhost:5173')
  })

  it('rejects an unlisted origin', () => {
    expect(resolveAllowedOrigin('https://evil.example.com', '')).toBeNull()
  })

  it('allows a configured production origin', () => {
    expect(resolveAllowedOrigin('https://emmanuellesingani.com', 'https://emmanuellesingani.com')).toBe(
      'https://emmanuellesingani.com'
    )
  })
})

describe('corsHeaders', () => {
  it('includes Access-Control-Allow-Origin for an allowed origin', () => {
    const headers = corsHeaders('http://localhost:5173')
    expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:5173')
    expect(headers['Vary']).toBe('Origin')
  })

  it('omits Access-Control-Allow-Origin for a disallowed origin', () => {
    const headers = corsHeaders('https://evil.example.com')
    expect(headers['Access-Control-Allow-Origin']).toBeUndefined()
  })
})
