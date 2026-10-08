/**
 * Answer matching for the home page puzzle. Pure, so the route handler stays
 * thin and the rules can be tested without a server.
 */

/**
 * The riddle stage resends the coordinate, so posting a riddle answer alone
 * cannot skip the first gate.
 */
export type GateRequest = { coordinate: string; answer?: string }

export type GateResponse =
  | { stage: 'riddle'; riddle: string }
  | {
      stage: 'reveal'
      title: string
      date: string
      link: { href: string; label: string } | null
    }

/** Longer than any answer anyone would type or paste, short enough to bound the regex. */
export const MAX_INPUT = 64

type Degrees = { value: number; decimals: number }

/**
 * A number, an optional degree sign, then an optional hemisphere letter. Any
 * separator between the two is ignored, so pasted and hand-typed values parse.
 */
const COORDINATE_PART = /([+-]?\d+(?:\.\d+)?)\s*°?\s*([NSEW])?/gi

export function parseCoordinate(input: string): Degrees[] | null {
  const parts = [...input.matchAll(COORDINATE_PART)]
  return parts.length === 2 ? parts.map(toDegrees) : null
}

function toDegrees([, number = '', hemisphere = '']: RegExpMatchArray) {
  const magnitude = Math.abs(Number(number))
  const negative = number.startsWith('-') || /[SW]/i.test(hemisphere)
  return {
    value: negative ? -magnitude : magnitude,
    decimals: number.split('.')[1]?.length ?? 0
  }
}

/**
 * The guess is rounded to however precise the stored answer is, so storing
 * `51.5074,-0.1278` accepts `51.50741, -0.12779` but not `51.51, -0.13`.
 */
export function matchesCoordinate(guess: string, answer: string) {
  const expected = parseCoordinate(answer)
  const actual = parseCoordinate(guess)
  if (!expected || !actual) return false

  return expected.every(
    ({ value, decimals }, index) =>
      Number(actual[index].value.toFixed(decimals)) === value
  )
}

/** Ignores case, accents, spacing, punctuation and a leading "the". */
export function normaliseRiddleAnswer(input: string) {
  return input
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/^the\s+/, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
}

export function matchesRiddle(guess: string, answer: string) {
  const expected = normaliseRiddleAnswer(answer)
  return expected.length > 0 && normaliseRiddleAnswer(guess) === expected
}
