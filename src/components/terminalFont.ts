import { VT323 } from 'next/font/google'

/**
 * The CRT prompt and the terminal screens after it share one face, so leaving
 * the machine reads as going further into it. `block` because the CRT paints
 * with it into a canvas, where a fallback face would be baked in for good.
 */
export const terminalFont = VT323({
  weight: '400',
  subsets: ['latin'],
  display: 'block'
})
