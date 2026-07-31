'use client'

import * as React from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { useReducedMotion } from 'framer-motion'
import { CameraRig, CAMERA_FOV, CAMERA_POSITION } from './CameraRig'
import { FOG, type SlideAction } from './config'
import { Effects } from './Effects'
import { FogLayers } from './FogLayers'
import { Lighting } from './Lighting'
import { LightShafts } from './LightShafts'
import { OldComputer } from './OldComputer'
import { Rain } from './Rain'
import { Staging } from './Staging'
import { useSceneActive } from './useSceneActive'

type SceneProps = {
  /** Fires once the scene is composed and has actually drawn a few frames. */
  onReady?: () => void
  /** Handed the slide action when the CRT is clicked. */
  onActivate?: (action: SlideAction) => void
  /** Holds the slideshow, e.g. while the store dialog is open. */
  paused?: boolean
}

/**
 * Waits for real frames before declaring the scene ready.
 *
 * React state says the materials are in place; it does not say anything has
 * been rasterised. The first frames also carry one-off work — shader compiles,
 * the environment bake, the reflection's first pass — so fading up immediately
 * would reveal the scene mid-stutter. A few frames of headroom costs nothing
 * and guarantees there is something finished to look at.
 */
function WhenDrawn({
  enabled,
  onDrawn
}: {
  enabled: boolean
  onDrawn?: () => void
}) {
  const drawn = React.useRef(0)
  const fired = React.useRef(false)

  useFrame(() => {
    if (!enabled || fired.current) return
    drawn.current += 1
    if (drawn.current < 4) return
    fired.current = true
    onDrawn?.()
  })

  return null
}

export default function Scene({ onReady, onActivate, paused }: SceneProps) {
  const container = React.useRef<HTMLDivElement>(null)
  const active = useSceneActive(container)
  const reducedMotion = useReducedMotion() ?? false

  const [quality, setQuality] = React.useState<'high' | 'low'>('high')
  const [screen, setScreen] = React.useState<THREE.Vector3 | null>(null)
  const [composed, setComposed] = React.useState(false)

  const handleScreenMeasured = React.useCallback(
    (centre: THREE.Vector3) => setScreen(centre),
    []
  )

  const handleComposed = React.useCallback(() => setComposed(true), [])

  return (
    // pan-y rather than none: horizontal drags reach the scene as pointer
    // events, while vertical ones stay with the browser so the page can still
    // be scrolled once content sits below the canvas.
    <div ref={container} className="fixed inset-0 h-screen w-full touch-pan-y">
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
          Black, and dense enough that the ground reaches it well before the
          plane ends. That is what removes the horizon: the floor and the sky
          converge on the same colour, so there is no line where they meet and
          the top of the frame is simply black.
        */}
        <fogExp2 attach="fog" args={[FOG.colour, FOG.density]} />

        {/*
          Drives the quality tier.

          No onFallback handler on purpose. Wiring it to drop to low meant that
          after a few flip-flops the scene downgraded permanently a few seconds
          after load, every time, on hardware that was coping fine — the very
          pop it was added to prevent. Without a handler, flipflops still stops
          the oscillation; it just settles where it is instead of giving up.

          The bounds are relaxed for the same reason: the default steps down
          below 50fps, which this scene dips under briefly without being in any
          real trouble.
        */}
        <PerformanceMonitor
          bounds={() => [28, 58]}
          flipflops={3}
          onDecline={() => setQuality('low')}
          onIncline={() => setQuality('high')}
        />

        <React.Suspense fallback={null}>
          <OldComputer
            reducedMotion={reducedMotion}
            onScreenMeasured={handleScreenMeasured}
            onReady={handleComposed}
            onActivate={onActivate}
            paused={paused}
          />
          <Lighting />
          <LightShafts />
          <FogLayers quality={quality} reducedMotion={reducedMotion} />
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
        <WhenDrawn enabled={composed} onDrawn={onReady} />
      </Canvas>
    </div>
  )
}
