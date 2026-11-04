'use client'

import * as React from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { useReducedMotion } from 'framer-motion'
import { useSceneActive } from '../three/useSceneActive'
import { CameraDrift } from './CameraDrift'
import { FOG_DENSITY, PALETTE } from './config'
import { Door, type DoorBounds } from './Door'
import { DoorHint } from './DoorHint'
import { DoorRain } from './DoorRain'
import { Effects } from './Effects'
import { Mist } from './Mist'
import { Sky, SUN_DIRECTION } from './Sky'
import { Terrain } from './Terrain'

/** Fires after a few real frames, so the fade never reveals shader compiles. */
function WhenDrawn({ onDrawn }: { onDrawn?: () => void }) {
  const drawn = React.useRef(0)
  useFrame(() => {
    drawn.current += 1
    if (drawn.current === 4) onDrawn?.()
  })
  return null
}

type SceneProps = {
  /** Fires once the scene has actually drawn a few frames. */
  onReady?: () => void
  /** Swings the door open. */
  open: boolean
  /** A click or tap on the shut door. */
  onDoorPress: () => void
  /** Shows "step inside" over the door. */
  hint: boolean
}

export default function Scene({
  onReady,
  open,
  onDoorPress,
  hint
}: SceneProps) {
  const container = React.useRef<HTMLDivElement>(null)
  const active = useSceneActive(container)
  const reducedMotion = useReducedMotion() ?? false
  const [door, setDoor] = React.useState<DoorBounds | null>(null)

  const sun = React.useMemo(
    () => SUN_DIRECTION.clone().multiplyScalar(40).toArray(),
    []
  )

  return (
    <div
      ref={container}
      role="img"
      aria-label="A lone door standing on a misty hillside, with rain falling on it and nowhere else."
      className="fixed inset-0 h-dvh w-full"
    >
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 1.5]}
        frameloop={active ? 'always' : 'never'}
        camera={{ near: 0.1, far: 3000 }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          // The composer tone maps, after bloom has seen the sky's real values.
          toneMapping: THREE.NoToneMapping
        }}
      >
        <fogExp2 attach="fog" args={[PALETTE.haze, FOG_DENSITY]} />
        <CameraDrift reducedMotion={reducedMotion} approach={open} />

        {/* Overcast: almost all the light is the sky itself, with a weak sun
            behind the door to rim it. */}
        <hemisphereLight args={['#c4dcdc', '#2f4c3c', 0.95]} />
        <directionalLight
          position={sun as [number, number, number]}
          intensity={1.1}
          color={PALETTE.sunGlow}
        />
        {/*
          A soft key raking in from the left. The sun is behind the door, so
          without this its face gets only flat fill and the frame and handle
          vanish. Shadows are framed tightly on the door so they stay crisp.
        */}
        <directionalLight
          position={[-8, 5, 5]}
          intensity={1.6}
          color="#e4f1ee"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
          shadow-normalBias={0.02}
          shadow-camera-left={-2}
          shadow-camera-right={2}
          shadow-camera-top={3}
          shadow-camera-bottom={-1}
          shadow-camera-near={1}
          shadow-camera-far={25}
        />

        <React.Suspense fallback={null}>
          <Sky reducedMotion={reducedMotion} />
          <Terrain />
          <Door
            open={open}
            onMeasured={setDoor}
            onPress={onDoorPress}
            reducedMotion={reducedMotion}
          />
          {door && <DoorRain door={door} />}
          {door && <DoorHint top={door.max.y} shown={hint} />}
          <ContactShadows
            position={[0, 0.01, 0]}
            scale={5}
            blur={2.6}
            opacity={0.55}
            far={2.5}
            frames={1}
          />
          <Mist reducedMotion={reducedMotion} />
          {/* The door is part metal, so it needs something to reflect. Built from
              lightformers rather than an HDRI, so nothing is fetched. */}
          <Environment resolution={64} frames={1}>
            <Lightformer
              form="rect"
              intensity={1.2}
              color={PALETTE.haze}
              position={[0, 6, -8]}
              scale={[30, 12, 1]}
            />
            <Lightformer
              form="rect"
              intensity={0.5}
              color={PALETTE.grassDark}
              position={[0, -4, 0]}
              rotation-x={Math.PI / 2}
              scale={[30, 30, 1]}
            />
            <Lightformer
              form="circle"
              intensity={3}
              color={PALETTE.sunGlow}
              position={sun as [number, number, number]}
              scale={6}
            />
          </Environment>
          <Effects />
          <WhenDrawn onDrawn={onReady} />
        </React.Suspense>
      </Canvas>
    </div>
  )
}
