/** The character in a template that a typed digit fills. */
export const SLOT = '_'

/**
 * Fills a template's slots with digits in order. `next` is the index of the
 * first slot still empty, or null once every slot is filled.
 */
export function fillTemplate(template: string, digits: string) {
  let used = 0
  let next: number | null = null
  const text = [...template]
    .map((char, index) => {
      if (char !== SLOT) return char
      if (used < digits.length) return digits[used++]
      next ??= index
      return char
    })
    .join('')
  return { text, next }
}

export function countSlots(template: string) {
  return [...template].filter((char) => char === SLOT).length
}
