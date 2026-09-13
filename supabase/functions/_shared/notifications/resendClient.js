// Thin wrapper around Resend's HTTP API. No SDK dependency — Resend's API
// is a single plain POST, and avoiding an npm import here keeps this
// function's dependency surface minimal. RESEND_API_KEY is read by the
// caller from Deno.env and passed in; this module never reads env itself,
// which keeps it trivially testable with a mocked fetch.

/**
 * @param {object} params
 * @param {string} params.apiKey
 * @param {string} params.from
 * @param {string} params.to
 * @param {string} params.subject
 * @param {string} params.html
 * @param {string} params.text
 * @returns {Promise<{ok: true, messageId: string} | {ok: false, error: string}>}
 */
export async function sendEmailViaResend({ apiKey, from, to, subject, html, text }) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) {
      return { ok: false, error: body?.message ?? `Resend API error (HTTP ${response.status})` }
    }
    return { ok: true, messageId: body?.id ?? null }
  } catch (err) {
    return { ok: false, error: err?.message ?? 'Network error calling Resend' }
  }
}
