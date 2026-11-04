import { readFile } from 'node:fs/promises'
import path from 'node:path'
import {
  decrypt,
  encrypt,
  readMasterKey,
  sessionKey,
  verifyToken
} from '@/lib/listen'

/** Committed encrypted; see scripts/encrypt-audio.mjs. Traced into the function by next.config.js. */
const TRACK = path.join(process.cwd(), 'private', 'black-sheep.mp3.enc')

/**
 * Serves the track to someone holding a fresh token from a solved riddle.
 *
 * The stored file is re-encrypted under the token's own key on every request,
 * so the response is neither the committed file nor playable without the key
 * that came with the reveal. POST keeps the token out of URLs and logs.
 */
export async function POST(request: Request) {
  const master = readMasterKey(process.env.AUDIO_KEY)
  if (!master) {
    console.error('listen: AUDIO_KEY must be set to 32 bytes, base64')
    return new Response(null, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  const token =
    typeof body === 'object' && body !== null && 'token' in body
      ? String(body.token)
      : ''
  if (!verifyToken(master, token, Date.now())) {
    return new Response(null, { status: 401 })
  }

  const track = decrypt(master, await readFile(TRACK))
  return new Response(
    new Uint8Array(encrypt(sessionKey(master, token), track)),
    {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'no-store, private'
      }
    }
  )
}
