'use client'

import * as React from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { useReducedMotion } from 'framer-motion'
import { CameraRig, CAMERA_FOV, CAMERA_POSITION } from './CameraRig'
import { Effects } from './Effects'
import { Lighting } from './Lighting'
import { OldComputer } from './OldComputer'
import { Staging } from './Staging'
import { useSceneActive } from './useSceneActive'

export default function Scene() {
  const container = React.useRef<HTMLDivElement>(null)
  const active = useSceneActive(container)
  const reducedMotion = useReducedMotion() ?? false

  const [quality, setQuality] = React.useState<'high' | 'low'>('high')

  return (
    <div ref={container} className="fixed inset-0 h-screen w-full">
      <Canvas
        // R3F's bare `shadows` resolves to PCFSoftShadowMap, deprecated in
        // three 0.185. Plain PCF is ample here since ContactShadows does most
        // of the grounding.
        shadows={{ type: THREE.PCFShadowMap }}
        // Retina panels render four times the pixels for very little visible
        // gain on a scene this dark and this soft.
        dpr={[1, 1.5]}
        frameloop={active ? 'always' : 'never'}
        camera={{
          fov: CAMERA_FOV,
          position: CAMERA_POSITION,
          near: 0.1,
          far: 120
        }}
        gl={{
          antialias: false, // the composer handles edges; MSAA would be wasted
          powerPreference: 'high-performance',
          // Hand the composer untone-mapped HDR so bloom sees the screen's real
          // intensity. A ToneMapping effect closes the chain instead.
          toneMapping: THREE.NoToneMapping
        }}
      >
        <color attach="background" args={['#000000']} />
        {/*
          Dissolves the floor into the background long before its edge. Kept
          deliberately thin: fog is distance-based, and narrow viewports pull the
          camera back to ~13 units, so a denser value would start eating the
          subject itself rather than just the horizon.
        */}
        <fogExp2 attach="fog" args={['#000000', 0.026]} />

        <PerformanceMonitor
          onDecline={() => setQuality('low')}
          onIncline={() => setQuality('high')}
        />

        <React.Suspense fallback={null}>
          <OldComputer reducedMotion={reducedMotion} />
          <Lighting />
          <Staging />
          <Effects quality={quality} />
        </React.Suspense>

        <CameraRig reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  )
}
