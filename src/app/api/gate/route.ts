import {
  MAX_INPUT,
  matchesRiddle,
  normaliseRiddleAnswer,
  type GateResponse
} from '@/lib/gate'
import { issueToken, readMasterKey, sessionKey } from '@/lib/listen'

/**
 * Opening the door asks for the riddle; answering it right unlocks the track.
 *
 * The riddle and its answer live in env vars so neither is in the client
 * bundle or in git. A wrong answer is a bare 401: the
 * client shows the same jitter whatever was typed.
 */
export async function POST(request: Request) {
  const env = readEnv()
  if (!env) {
    console.error('gate: RIDDLE_ANSWER and RIDDLE_TEXT must both be set')
    return new Response(null, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  const answer = readString(body, 'answer')

  if (answer === undefined) {
    return Response.json({
      stage: 'riddle',
      riddle: env.riddle
    } satisfies GateResponse)
  }

  if (answer === null || !matchesRiddle(answer, env.riddleAnswer)) {
    return new Response(null, { status: 401 })
  }

  return Response.json({
    stage: 'reveal',
    listen: issueListen()
  } satisfies GateResponse)
}

/** Without a key the reveal still shows; it just stays silent. */
function issueListen() {
  const master = readMasterKey(process.env.AUDIO_KEY)
  if (!master) {
    console.error('gate: AUDIO_KEY is not set, so the reveal will be silent')
    return undefined
  }
  const token = issueToken(master, Date.now())
  return { token, key: sessionKey(master, token).toString('base64') }
}

function readEnv() {
  const riddleAnswer = process.env.RIDDLE_ANSWER
  const riddle = process.env.RIDDLE_TEXT
  if (!riddleAnswer || !riddle) return null
  // A malformed answer would reject every guess without saying why.
  if (!normaliseRiddleAnswer(riddleAnswer)) return null

  return { riddleAnswer, riddle }
}

/** `undefined` when the field is absent, `null` when it is present but unusable. */
function readString(body: unknown, key: string) {
  if (typeof body !== 'object' || body === null || !(key in body)) {
    return undefined
  }
  const value = (body as Record<string, unknown>)[key]
  return typeof value === 'string' && value.length <= MAX_INPUT ? value : null
}
