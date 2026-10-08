import type { GateRequest, GateResponse } from '@/lib/gate'

/**
 * Null for a wrong answer. A failed request is treated the same way, since the
 * screen has only one way to say no; the console keeps the real reason.
 */
export async function submitAnswer(
  body: GateRequest
): Promise<GateResponse | null> {
  try {
    const response = await fetch('/api/gate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (response.status !== 401 && !response.ok) {
      console.error(`gate: answer check failed with ${response.status}`)
    }
    return response.ok ? ((await response.json()) as GateResponse) : null
  } catch (error) {
    console.error('gate: answer check failed', error)
    return null
  }
}
