'use client'

import * as React from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { useReducedMotion } from 'framer-motion'
import { Backdrop } from './Backdrop'
import { CameraRig, CAMERA_FOV, CAMERA_POSITION } from './CameraRig'
import { FOG } from './config'
import { Effects } from './Effects'
import { Lighting } from './Lighting'
import { LightShafts } from './LightShafts'
import { OldComputer } from './OldComputer'
import { Rain } from './Rain'
import { Staging } from './Staging'
import { useSceneActive } from './useSceneActive'

export default function Scene() {
  const container = React.useRef<HTMLDivElement>(null)
  const active = useSceneActive(container)
  const reducedMotion = useReducedMotion() ?? false

  const [quality, setQuality] = React.useState<'high' | 'low'>('high')
  const [screen, setScreen] = React.useState<THREE.Vector3 | null>(null)

  const handleScreenMeasured = React.useCallback(
    (centre: THREE.Vector3) => setScreen(centre),
    []
  )

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
          Dissolves the floor into the sky long before its edge. Tinted to the
          backdrop's horizon rather than black, so the ground melts into the sky
          instead of cutting a hard line against it, and so the haze it leaves on
          the machine reads as night air rather than grey wash.
        */}
        <fogExp2 attach="fog" args={[FOG.colour, FOG.density]} />

        {/*
          Drives the quality tier. flipflops/onFallback stop it oscillating
          between tiers on a device sitting near the threshold, which would
          otherwise pop the puddle reflections in and out.
        */}
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setQuality('low')}
          onIncline={() => setQuality('high')}
          onFallback={() => setQuality('low')}
        />

        <React.Suspense fallback={null}>
          <OldComputer
            reducedMotion={reducedMotion}
            onScreenMeasured={handleScreenMeasured}
          />
          <Backdrop />
          <Lighting />
          <LightShafts />
          <Staging quality={quality} reducedMotion={reducedMotion} />
          {/*
            Falling rain is the one thing here that cannot be made still and
            still make sense, so under reduced motion it is dropped entirely.
            The puddles stay, which carries the idea on their own.
          */}
          {!reducedMotion && <Rain glow={screen} />}
          <Effects quality={quality} />
        </React.Suspense>

        <CameraRig reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  )
}
