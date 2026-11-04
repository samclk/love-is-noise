import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual
} from 'node:crypto'

/**
 * Server-side crypto for the track that plays once the riddle is solved.
 *
 * The repo is public, so the track is committed only as ciphertext under a
 * master key held in the environment (`AUDIO_KEY`, 32 random bytes, base64).
 * Solving the riddle earns a short-lived token; the listen endpoint swaps the
 * master encryption for one under a key derived from that token, so what
 * crosses the network is never the stored file and never playable on its own.
 *
 * Every payload is `iv (12 bytes) | ciphertext | tag (16 bytes)`, the layout
 * WebCrypto's AES-GCM expects, so the browser can decrypt it as sent.
 */

const IV_BYTES = 12
const TAG_BYTES = 16

/** Long enough to fetch and decode on a slow connection, short enough to be useless shared. */
export const TOKEN_TTL_MS = 2 * 60 * 1000

export function readMasterKey(encoded: string | undefined) {
  if (!encoded) return null
  const key = Buffer.from(encoded, 'base64')
  return key.length === 32 ? key : null
}

export function encrypt(key: Buffer, plaintext: Buffer) {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  return Buffer.concat([iv, ciphertext, cipher.getAuthTag()])
}

/** Throws if the key is wrong or a single byte has been changed. */
export function decrypt(key: Buffer, payload: Buffer) {
  const iv = payload.subarray(0, IV_BYTES)
  const tag = payload.subarray(payload.length - TAG_BYTES)
  const ciphertext = payload.subarray(IV_BYTES, payload.length - TAG_BYTES)
  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()])
}

/** `expiry.signature`. Stateless: the signature is all the server needs to trust it. */
export function issueToken(master: Buffer, now: number) {
  const expiry = String(now + TOKEN_TTL_MS)
  return `${expiry}.${sign(master, expiry)}`
}

export function verifyToken(master: Buffer, token: string, now: number) {
  const [expiry = '', signature = ''] = token.split('.')
  if (!/^\d+$/.test(expiry) || Number(expiry) < now) return false
  const expected = Buffer.from(sign(master, expiry))
  const actual = Buffer.from(signature)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

/** The key a token's audio is sent under. Derived, so nothing has to be stored. */
export function sessionKey(master: Buffer, token: string) {
  return createHmac('sha256', master).update(`session:${token}`).digest()
}

function sign(master: Buffer, expiry: string) {
  return createHmac('sha256', master)
    .update(`token:${expiry}`)
    .digest('base64url')
}
