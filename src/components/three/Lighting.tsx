'use client'

import * as React from 'react'
import type * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { FLOOD, RIM, SHAFT } from './config'

/**
 * Everything except the screen itself, which carries its own light and lives in
 * OldComputer so the two stay in sync.
 *
 * Built around the album artwork's palette: a red flood washing the ground, a
 * cold steel rim cutting the silhouette out of the dark, and cream from above
 * standing in for the streetlamps. Ambient stays near-black so those three do
 * all the work.
 */
export function Lighting() {
  const shadowCaster = React.useRef<THREE.DirectionalLight>(null)
  const frames = React.useRef(0)

  /**
   * Bakes the shadow map once instead of every frame.
   *
   * Both the caster and the light are static — only the camera moves, and a
   * directional light's shadow does not depend on the camera. three still
   * re-rendered the whole scene into the shadow map on every frame, which was
   * one of four full scene traversals happening per frame.
   *
   * A few frames of grace first, so the model is definitely in place before the
   * one render that gets kept.
   */
  useFrame(() => {
    const light = shadowCaster.current
    if (!light || frames.current > 4) return

    frames.current += 1
    if (frames.current === 4) {
      light.shadow.autoUpdate = false
      // Renders exactly once more, then three clears the flag itself.
      light.shadow.needsUpdate = true
    }
  })

  return (
    <>
      <ambientLight intensity={0.03} />

      {/*
        The red street is emitted by the ground itself rather than thrown by a
        light — see Staging. Lighting the scene red instead turns the machine
        into a red object, when the artwork keeps its foreground almost black and
        puts all the red behind and beneath it.

        All that is wanted on the machine is a low red kick from the side, so its
        edges pick up the street without its faces washing out.
      */}
      <directionalLight
        position={[-6, 0.7, 3.5]}
        intensity={0.22}
        color={FLOOD}
      />

      {/* Cold, from behind and above. The only shadow caster — a second would
          muddy the floor. */}
      <directionalLight
        ref={shadowCaster}
        position={[-3.5, 4.5, -5]}
        intensity={1.7}
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

      {/* Cream from high up, the streetlamps the shafts belong to. */}
      <directionalLight position={[2.5, 7, 2]} intensity={0.5} color={SHAFT} />

      {/* Just enough from the front to keep the case out of pure black. */}
      <directionalLight position={[4, 2, 6]} intensity={0.12} color={RIM} />

      {/*
        Reflections come from hand-placed emissive planes rather than an HDRI,
        so nothing is fetched from a third-party CDN at runtime. frames={1}
        bakes the environment once instead of every frame. These are what the
        puddles and the bezel pick up.
      */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          form="rect"
          intensity={0.4}
          color={FLOOD}
          position={[-3, 1.2, 3]}
          scale={[6, 2, 1]}
          target={[0, 1.4, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.9}
          color={RIM}
          position={[3.5, 3, -2.5]}
          scale={[5, 4, 1]}
          target={[0, 1.4, 0]}
        />
        <Lightformer
          form="ring"
          intensity={0.5}
          color={SHAFT}
          position={[0, 6, 1]}
          scale={[3, 3, 1]}
          target={[0, 1.4, 0]}
        />
      </Environment>
    </>
  )
}
