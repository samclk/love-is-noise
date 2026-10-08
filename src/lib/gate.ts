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
  | { stage: 'reveal'; title: string; date: string }

/** Longer than any answer anyone would type or paste, short enough to bound the regex. */
export const MAX_INPUT = 64

type Degrees = { value: number; decimals: number }

const NUMBER = /[+-]?\d+(?:\.\d+)?/g

/**
 * Reads a latitude and longitude in decimal degrees or degrees, minutes and
 * seconds. Symbols (° ′ ″ ' ") are only separators, so typed and pasted forms
 * both parse; S and W, or a leading minus, make a half negative.
 */
export function parseCoordinate(input: string): Degrees[] | null {
  const halves = splitHalves(input)
  if (!halves) return null
  const parsed = halves.map(toDegrees)
  return parsed.every(Boolean) ? (parsed as Degrees[]) : null
}

/** Splits on hemisphere letters, then a comma, then by counting numbers. */
function splitHalves(input: string) {
  const byHemisphere = input.match(/[^NSEW]+[NSEW]/gi)
  if (byHemisphere?.length === 2) return byHemisphere

  const byComma = input.split(',')
  if (byComma.length === 2) return byComma

  const numbers = input.match(NUMBER) ?? []
  if (![2, 4, 6].includes(numbers.length)) return null
  const half = numbers.length / 2
  return [numbers.slice(0, half), numbers.slice(half)].map((part) =>
    part.join(' ')
  )
}

function toDegrees(half: string): Degrees | null {
  const numbers = half.match(NUMBER)
  if (!numbers || numbers.length > 3) return null

  const [degrees = '', ...rest] = numbers
  const subdivisions = rest.map(Number)
  if (subdivisions.some((part) => part < 0 || part >= 60)) return null

  const [minutes = 0, seconds = 0] = subdivisions
  const magnitude = Math.abs(Number(degrees)) + minutes / 60 + seconds / 3600
  const negative = degrees.startsWith('-') || /[SW]/i.test(half)

  return {
    value: negative ? -magnitude : magnitude,
    // A stored answer in minutes or seconds is as precise as those units allow.
    decimals: rest.length
      ? DMS_DECIMALS[rest.length]
      : (degrees.split('.')[1]?.length ?? 0)
  }
}

/** One minute is ~0.017°, one second ~0.0003°. */
const DMS_DECIMALS: Record<number, number> = { 1: 2, 2: 4 }

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
