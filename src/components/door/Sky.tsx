'use client'

import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { createNoiseTexture } from '../three/noise'
import { PALETTE } from './config'

/** Direction of the hazy sun: high, behind the door, a little to the left. */
export const SUN_DIRECTION = new THREE.Vector3(-0.3, 0.42, -1).normalize()

/**
 * A gradient dome with soft drifting cloud and a veiled sun.
 *
 * The horizon colour matches the fog exactly, which is what makes the far hills
 * dissolve into the sky with no line where they meet. The sun goes above 1 so
 * bloom gives it a halo.
 */
export function Sky({ reducedMotion }: { reducedMotion: boolean }) {
  const materialRef = React.useRef<THREE.ShaderMaterial>(null)
  const texture = React.useMemo(() => createNoiseTexture(256, 6, 707), [])
  React.useEffect(() => () => texture.dispose(), [texture])

  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uDrift: { value: reducedMotion ? 0 : 1 },
      uNoise: { value: texture },
      uHaze: { value: new THREE.Color(PALETTE.haze) },
      uZenith: { value: new THREE.Color(PALETTE.zenith) },
      uSunColour: { value: new THREE.Color(PALETTE.sunGlow) },
      uCloud: { value: new THREE.Color(PALETTE.cloud) },
      uSun: { value: SUN_DIRECTION }
    }),
    [texture, reducedMotion]
  )

  useFrame(({ clock }) => {
    const material = materialRef.current
    if (material) material.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[1500, 48, 24]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}

const VERTEX = /* glsl */ `
  varying vec3 vDirection;

  void main() {
    vDirection = normalize(position);
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
  }
`

const FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uDrift;
  uniform sampler2D uNoise;
  uniform vec3 uHaze;
  uniform vec3 uZenith;
  uniform vec3 uSunColour;
  uniform vec3 uCloud;
  uniform vec3 uSun;

  varying vec3 vDirection;

  void main() {
    vec3 direction = normalize(vDirection);
    float altitude = max(direction.y, 0.0);

    // Deepens quickly, since the shot only sees the lowest part of the sky and
    // the pale wisps need something darker to show against.
    vec3 colour = mix(uHaze, uZenith, pow(smoothstep(0.0, 0.42, altitude), 0.8));

    // Wisps on a flat ceiling, so they foreshorten towards the horizon the way
    // real ones do. fract keeps the scroll from losing precision over time.
    vec2 ceiling = direction.xz / (altitude + 0.08);
    vec2 drift = fract(vec2(0.004, 0.0009) * uTime * uDrift);
    // Squashed along x so they stretch sideways, and pushed around by a second
    // sample so their edges curl rather than run straight.
    vec2 p = ceiling * vec2(0.16, 0.3);
    float warp = texture2D(uNoise, p * 0.6 - drift * 0.5).r;
    p += vec2(warp * 0.45, warp * 0.12);
    float a = texture2D(uNoise, p + drift).r;
    float b = texture2D(uNoise, p * vec2(2.6, 3.4) - drift * 1.6).r;
    float wisp = smoothstep(0.55, 0.85, a * 0.6 + b * 0.4);
    wisp *= smoothstep(0.03, 0.12, altitude);
    colour = mix(colour, uCloud, wisp * 0.6);

    float sun = max(dot(direction, uSun), 0.0);
    colour += uSunColour * (pow(sun, 18.0) * 0.55 + pow(sun, 420.0) * 1.4);

    gl_FragColor = vec4(colour, 1.0);
  }
`
