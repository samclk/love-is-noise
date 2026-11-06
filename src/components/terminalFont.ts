import { VT323 } from 'next/font/google'

/**
 * The face of the terminal screens through the door. `block` so the riddle
 * never starts typing itself out in a fallback face and then jumps.
 */
export const terminalFont = VT323({
  weight: '400',
  subsets: ['latin'],
  display: 'block'
})
