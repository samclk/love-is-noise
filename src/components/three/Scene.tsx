'use client'

import * as React from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { useReducedMotion } from 'framer-motion'
import { CameraRig, CAMERA_FOV, CAMERA_POSITION } from './CameraRig'
import { FOG } from './config'
import { Effects } from './Effects'
import { FogLayers } from './FogLayers'
import { Lighting } from './Lighting'
import { LightShafts } from './LightShafts'
import { OldComputer, type ScreenBounds } from './OldComputer'
import { Rain } from './Rain'
import { Staging } from './Staging'
import { useSceneActive } from './useSceneActive'

type SceneProps = {
  /** Fires once the scene is composed and has actually drawn a few frames. */
  onReady?: () => void
  /** Any tap or click on the scene, so the page can hand focus to the prompt. */
  onPress?: () => void
  /** What has been typed at the CRT prompt. */
  text: string
  /** Each increment dips the tube once. */
  rejections: number
  /** Switches the tube off. */
  off: boolean
  /** Fires once the tube has gone fully dark. */
  onPoweredOff?: () => void
  /** Flies the camera in until the glass fills the view, so typing is legible on a phone. */
  zoomed: boolean
  /** Holds the zoomed glass in the top half, clear of an on-screen keyboard. */
  raised: boolean
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

export default function Scene({
  onReady,
  onPress,
  text,
  rejections,
  off,
  onPoweredOff,
  zoomed,
  raised
}: SceneProps) {
  const container = React.useRef<HTMLDivElement>(null)
  const active = useSceneActive(container)
  const reducedMotion = useReducedMotion() ?? false

  const [quality, setQuality] = React.useState<'high' | 'low'>('high')
  const [screen, setScreen] = React.useState<ScreenBounds | null>(null)
  const [composed, setComposed] = React.useState(false)

  const handleScreenMeasured = React.useCallback(
    (bounds: ScreenBounds) => setScreen(bounds),
    []
  )

  const handleComposed = React.useCallback(() => setComposed(true), [])

  return (
    /*
      touch-action matters more than it looks. This was pan-y, meaning the
      browser claimed any gesture with a vertical component for a scroll — and
      the page does not scroll at all, so there was nothing to scroll. It was
      cancelling most drags before the scene ever saw them, for no benefit.

      It is `none`, and on the canvas rather than here. pinch-zoom would have
      been the nicer value — the browser keeps zooming, the app gets the pans —
      but Safari does not recognise it, and an unrecognised value invalidates the
      whole declaration and falls back to auto. That silently hands every gesture
      straight back to the browser on exactly the devices this matters most on.

      Scoping it to the canvas keeps the cost small: there is no text in a 3D
      scene to enlarge, and the riddle and reveal replace it with zooming intact.

      Revisit when content lands below the canvas — page scrolling will then need
      a route back, most likely by making the canvas not the scroll container.
    */
    /*
      h-dvh, not h-screen. 100vh on iOS deliberately means the *largest*
      viewport — the height the page would have if the browser toolbars were
      hidden — so the canvas ran taller than the visible area, its centre fell
      below the centre of the screen, and the machine sat low. dvh tracks what is
      actually visible.

      Safe from resize jank here because the page does not scroll, so the toolbar
      never collapses and dvh stays put.
    */
    <div
      ref={container}
      className="fixed inset-0 h-dvh w-full [&_canvas]:touch-none"
      onClick={onPress}
    >
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
            text={text}
            rejections={rejections}
            off={off}
            onPoweredOff={onPoweredOff}
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
          {!reducedMotion && <Rain glow={screen?.centre ?? null} />}
          <Effects quality={quality} />
        </React.Suspense>

        {/* Same signal as the fade, so the arc plays as the scene appears. */}
        <CameraRig
          reducedMotion={reducedMotion}
          begin={composed}
          zoomTo={zoomed ? screen : null}
          raised={raised}
        />
        <WhenDrawn enabled={composed} onDrawn={onReady} />
      </Canvas>
    </div>
  )
}
