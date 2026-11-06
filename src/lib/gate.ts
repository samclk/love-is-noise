/**
 * Answer matching for the home page puzzle. Pure, so the route handler stays
 * thin and the rules can be tested without a server.
 */

/** No answer asks for the riddle; an answer is a guess at it. */
export type GateRequest = { answer?: string }

/** What the browser needs to fetch and decrypt the track, once and briefly. */
export type Listen = { token: string; key: string }

export type GateResponse =
  { stage: 'riddle'; riddle: string } | { stage: 'reveal'; listen?: Listen }

/** Longer than any answer anyone would type or paste, short enough to bound the work. */
export const MAX_INPUT = 64

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
