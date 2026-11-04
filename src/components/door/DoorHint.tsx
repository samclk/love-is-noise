'use client'

import { Html } from '@react-three/drei'
import { terminalFont } from '@/components/terminalFont'

/**
 * Points newcomers at the door. Anchored in the scene rather than the page, so
 * it stays over the door as the camera sways and on any screen shape.
 *
 * Kept below the page's fade curtain (z-10), so it goes dark with the scene.
 */
export function DoorHint({ top, shown }: { top: number; shown: boolean }) {
  return (
    <Html position={[0, top + 0.9, 0]} center zIndexRange={[5, 0]}>
      <p
        aria-hidden
        className={`${terminalFont.className} pointer-events-none whitespace-nowrap text-2xl text-[#8fe1eb] transition-opacity duration-1000 ease-out [text-shadow:0_0_8px_rgb(143_225_235/0.55)]`}
        style={{ opacity: shown ? 1 : 0 }}
      >
        <span className="motion-safe:animate-flash">step inside</span>
      </p>
    </Html>
  )
}
