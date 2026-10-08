import {
  MAX_INPUT,
  matchesCoordinate,
  matchesRiddle,
  normaliseRiddleAnswer,
  parseCoordinate,
  type GateResponse
} from '@/lib/gate'

/**
 * Checks one answer and returns the next stage's content only when it is right.
 *
 * Everything lives in env vars so the answers, the riddle and the reveal are
 * never in the client bundle or in git. A wrong answer is a bare 401: the
 * client shows the same flicker whatever was typed.
 */
export async function POST(request: Request) {
  const env = readEnv()
  if (!env) {
    console.error(
      'gate: GATE_COORDINATE (two numbers), RIDDLE_ANSWER, RIDDLE_TEXT, REVEAL_TITLE and REVEAL_DATE must all be set'
    )
    return new Response(null, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  const coordinate = readString(body, 'coordinate')
  const answer = readString(body, 'answer')
  if (typeof coordinate !== 'string') {
    return new Response(null, { status: 400 })
  }

  if (!matchesCoordinate(coordinate, env.coordinate)) {
    return new Response(null, { status: 401 })
  }

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
    title: env.title,
    date: env.date,
    link: env.link ? { href: env.link, label: env.linkLabel } : null
  } satisfies GateResponse)
}

function readEnv() {
  const coordinate = process.env.GATE_COORDINATE
  const riddleAnswer = process.env.RIDDLE_ANSWER
  const riddle = process.env.RIDDLE_TEXT
  const title = process.env.REVEAL_TITLE
  const date = process.env.REVEAL_DATE
  if (!coordinate || !riddleAnswer || !riddle || !title || !date) return null
  // Either of these malformed would reject every answer without saying why.
  if (!parseCoordinate(coordinate) || !normaliseRiddleAnswer(riddleAnswer)) {
    return null
  }

  return {
    coordinate,
    riddleAnswer,
    riddle,
    title,
    date,
    link: process.env.REVEAL_LINK || null,
    linkLabel: process.env.REVEAL_LINK_LABEL || 'Pre-save'
  }
}

/** `undefined` when the field is absent, `null` when it is present but unusable. */
function readString(body: unknown, key: string) {
  if (typeof body !== 'object' || body === null || !(key in body)) {
    return undefined
  }
  const value = (body as Record<string, unknown>)[key]
  return typeof value === 'string' && value.length <= MAX_INPUT ? value : null
}
