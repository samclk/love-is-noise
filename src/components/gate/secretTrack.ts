import type { Listen } from '@/lib/gate'

/**
 * Plays the reveal's track without ever giving the page a file: no <audio>
 * element, no URL, no controls. The bytes arrive encrypted, are decrypted in
 * memory and handed straight to Web Audio.
 */

let context: AudioContext | null = null

/**
 * Browsers only let audio start from a user gesture, and the track starts after
 * an async round trip that no longer counts as one. Calling this from the
 * keystrokes that type the answer gets the context running in time.
 */
export function unlockAudio() {
  context ??= new AudioContext()
  if (context.state === 'suspended') void context.resume()
}

/** Fetches, decrypts and starts the track. Returns a stop function. */
export async function playTrack(listen: Listen, signal: AbortSignal) {
  const response = await fetch('/api/listen', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: listen.token }),
    cache: 'no-store',
    signal
  })
  if (!response.ok) throw new Error(`listen failed with ${response.status}`)

  // iv (12 bytes) | ciphertext | tag, as the server writes it.
  const payload = new Uint8Array(await response.arrayBuffer())
  const key = await crypto.subtle.importKey(
    'raw',
    Uint8Array.from(atob(listen.key), (char) => char.charCodeAt(0)),
    'AES-GCM',
    false,
    ['decrypt']
  )
  const mp3 = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: payload.subarray(0, 12) },
    key,
    payload.subarray(12)
  )

  unlockAudio()
  const audio = context!
  const buffer = await audio.decodeAudioData(mp3)
  signal.throwIfAborted()

  const source = audio.createBufferSource()
  source.buffer = buffer
  source.connect(audio.destination)
  source.start()
  return () => source.stop()
}
