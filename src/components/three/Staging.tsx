'use client'

import { ContactShadows } from '@react-three/drei'

/**
 * The surface the screen's glow lands on. Without something to catch the spill,
 * the CRT reads as a bright decal rather than a light source.
 *
 * The plane is far larger than the visible area and relies on the scene's fog
 * to dissolve it into black, so its edge and the horizon are never visible.
 */
export function Staging() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial
          color="#0b0a09"
          roughness={0.82}
          metalness={0.05}
        />
      </mesh>

      {/* Anchors the machine to the floor. The directional rim gives a shadow,
          but a soft contact occlusion is what stops it looking like it hovers. */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.75}
        scale={12}
        blur={2.6}
        far={4}
        resolution={512}
        color="#000000"
      />
    </>
  )
}
