'use client'

import { Environment, Lightformer } from '@react-three/drei'
import { RIM } from './config'

/**
 * Everything except the screen itself, which carries its own light and lives in
 * OldComputer so the two stay in sync.
 *
 * The rig is deliberately starved: near-black ambient, a cold rim to cut the
 * silhouette out of the background, and a fill dim enough that it reads as
 * bounce rather than a second key.
 */
export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.035} />

      {/* Cold, from behind and above, opposing the warm screen. The only
          shadow caster — a second would muddy the floor. */}
      <directionalLight
        position={[-3.5, 4.5, -5]}
        intensity={1.5}
        color={RIM}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
        shadow-camera-near={1}
        shadow-camera-far={16}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />

      {/* Just enough from the front to keep the case out of pure black. */}
      <directionalLight position={[4, 2, 6]} intensity={0.16} color={RIM} />

      {/*
        Reflections come from hand-placed emissive planes rather than an HDRI,
        so nothing is fetched from a third-party CDN at runtime. frames={1}
        bakes the environment once instead of every frame.
      */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={0.5}
          color="#ffd9a0"
          position={[-2.5, 2, 3]}
          scale={[4, 3, 1]}
          target={[0, 1.4, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.85}
          color={RIM}
          position={[3.5, 3, -2.5]}
          scale={[5, 4, 1]}
          target={[0, 1.4, 0]}
        />
        <Lightformer
          form="ring"
          intensity={0.25}
          color="#ffffff"
          position={[0, 5, 1]}
          scale={[3, 3, 1]}
          target={[0, 1.4, 0]}
        />
      </Environment>
    </>
  )
}
