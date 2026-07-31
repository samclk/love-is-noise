'use client'

import * as React from 'react'
import * as THREE from 'three'
import { FLOOD } from './config'

/**
 * The sky the scene stands under.
 *
 * This is not decoration. A mirror can only show what is above its own plane,
 * and against a pure black void the puddles were reflecting nothing — 100% of
 * a reflection of darkness still reads as a dark hole in the ground. Giving the
 * scene a lit sky is what puts colour into the water, the same way the artwork's
 * wet street works because there is a red city above it.
 *
 * One inverted sphere with a vertical gradient. No lighting, no fog, no passes.
 */
export function Backdrop() {
  const uniforms = React.useMemo(
    () => ({
      // Kept very dim. This is a night sky with the city's red bouncing off its
      // underside, not a red backdrop — in the artwork the sky is blue-black and
      // all the red lives on the ground. A reflection shows it directly, so it
      // does not need to be bright to do its job.
      uHorizon: { value: new THREE.Color(FLOOD).multiplyScalar(0.055) },
      uMid: { value: new THREE.Color('#0a0713') },
      uZenith: { value: new THREE.Color('#030208') }
    }),
    []
  )

  return (
    <mesh scale={[-1, 1, 1]}>
      {/* Low segment count: it is a smooth gradient, nothing to tessellate for. */}
      <sphereGeometry args={[46, 24, 16]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        // Always behind everything, and never occludes the scene in front of it.
        depthWrite={false}
        side={THREE.BackSide}
        toneMapped={false}
      />
    </mesh>
  )
}

const VERTEX = /* glsl */ `
  varying vec3 vWorld;

  void main() {
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAGMENT = /* glsl */ `
  uniform vec3 uHorizon;
  uniform vec3 uMid;
  uniform vec3 uZenith;

  varying vec3 vWorld;

  void main() {
    // Normalised height up the sphere. The red band sits a little above the
    // ground plane so the floor's fogged edge has somewhere dark to meet.
    float h = clamp(vWorld.y / 30.0, -1.0, 1.0);

    // Wide, overlapping ramps: narrow ones left visible bands across the sky.
    vec3 colour = mix(uHorizon, uMid, smoothstep(-0.12, 0.34, h));
    colour = mix(colour, uZenith, smoothstep(0.1, 0.95, h));

    // Below the ground the sky is never seen directly, but it is seen in the
    // reflection, so it fades out rather than banding to a hard edge.
    colour *= smoothstep(-0.5, -0.1, h);

    gl_FragColor = vec4(colour, 1.0);
  }
`
