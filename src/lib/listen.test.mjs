import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import {
  TOKEN_TTL_MS,
  decrypt,
  encrypt,
  issueToken,
  readMasterKey,
  sessionKey,
  verifyToken
} from './listen.ts'

const MASTER = randomBytes(32)
const NOW = 1_800_000_000_000

test('a token is good until it expires, and not after', () => {
  const token = issueToken(MASTER, NOW)
  assert.equal(verifyToken(MASTER, token, NOW), true)
  assert.equal(verifyToken(MASTER, token, NOW + TOKEN_TTL_MS), true)
  assert.equal(verifyToken(MASTER, token, NOW + TOKEN_TTL_MS + 1), false)
})

test('a token with a stretched expiry or a forged signature is refused', () => {
  const [, signature] = issueToken(MASTER, NOW).split('.')
  assert.equal(verifyToken(MASTER, `${NOW * 2}.${signature}`, NOW), false)
  assert.equal(verifyToken(MASTER, `${NOW + 1000}.forged`, NOW), false)
  assert.equal(
    verifyToken(randomBytes(32), issueToken(MASTER, NOW), NOW),
    false
  )
  for (const junk of ['', '.', 'abc', `${NOW + 1000}`]) {
    assert.equal(verifyToken(MASTER, junk, NOW), false, junk)
  }
})

test('audio survives encryption under its own key, and only its own', () => {
  const track = randomBytes(5000)
  const payload = encrypt(MASTER, track)
  assert.deepEqual(decrypt(MASTER, payload), track)
  assert.throws(() => decrypt(randomBytes(32), payload))
})

test('a tampered payload is refused rather than played', () => {
  const payload = encrypt(MASTER, randomBytes(100))
  payload[20] ^= 1
  assert.throws(() => decrypt(MASTER, payload))
})

test('each token gets its own session key', () => {
  const a = sessionKey(MASTER, issueToken(MASTER, NOW))
  const b = sessionKey(MASTER, issueToken(MASTER, NOW + 1))
  assert.equal(a.length, 32)
  assert.notDeepEqual(a, b)
})

test('the master key must be exactly 32 bytes of base64', () => {
  assert.equal(readMasterKey(undefined), null)
  assert.equal(readMasterKey(randomBytes(16).toString('base64')), null)
  assert.deepEqual(readMasterKey(MASTER.toString('base64')), MASTER)
})
