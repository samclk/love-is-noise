'use client'

import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RAIN, SPILL } from './config'

type RainProps = {
  /** Where the screen sits, so drops passing it pick up its amber. */
  glow: THREE.Vector3 | null
}

/**
 * Light rain, as one draw call.
 *
 * Every drop is a camera-facing quad in a single geometry. Falling, leaning,
 * fading and tinting all happen in the vertex shader from one time uniform, so
 * the per-frame CPU cost is a single float write no matter how many drops there
 * are. The cost that does scale is fill rate, which is why the streaks are thin,
 * dim and additively blended rather than textured.
 */
export function Rain({ glow }: RainProps) {
  const materialRef = React.useRef<THREE.ShaderMaterial>(null)

  const geometry = React.useMemo(() => buildGeometry(), [])

  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uHeight: { value: RAIN.height },
      uWidth: { value: RAIN.width },
      uSlant: { value: RAIN.slant },
      uColour: { value: new THREE.Color(RAIN.colour) },
      uGlowColour: { value: new THREE.Color(SPILL) },
      uGlow: { value: new THREE.Vector3(0, 2, 0) },
      uGlowFalloff: { value: 0.42 }
    }),
    []
  )

  React.useEffect(() => {
    if (glow) uniforms.uGlow.value.copy(glow)
  }, [glow, uniforms])

  React.useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(({ clock }) => {
    const material = materialRef.current
    if (material) material.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    // The shader moves drops far from their authored positions, so the bounding
    // sphere three would compute is meaningless. Culling has to be off.
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

function buildGeometry() {
  const { count, radius, height, speed, length, opacity } = RAIN

  const positions = new Float32Array(count * 4 * 3)
  const corners = new Float32Array(count * 4 * 2)
  const speeds = new Float32Array(count * 4)
  const lengths = new Float32Array(count * 4)
  const opacities = new Float32Array(count * 4)
  const indices = new Uint32Array(count * 6)

  // The four corners of each streak, in units the vertex shader scales.
  const CORNERS = [
    [-0.5, 0],
    [0.5, 0],
    [0.5, 1],
    [-0.5, 1]
  ]

  for (let drop = 0; drop < count; drop++) {
    // Square-rooted radius keeps the drops evenly spread across the disc
    // instead of bunching around the middle.
    const angle = Math.random() * Math.PI * 2
    const distance = Math.sqrt(Math.random()) * radius
    const x = Math.cos(angle) * distance
    const z = Math.sin(angle) * distance
    const y = Math.random() * height

    const dropSpeed = speed.min + Math.random() * (speed.max - speed.min)
    const dropLength = length.min + Math.random() * (length.max - length.min)
    const dropOpacity = opacity * (0.45 + Math.random() * 0.55)

    for (let corner = 0; corner < 4; corner++) {
      const v = drop * 4 + corner

      positions[v * 3] = x
      positions[v * 3 + 1] = y
      positions[v * 3 + 2] = z

      corners[v * 2] = CORNERS[corner][0]
      corners[v * 2 + 1] = CORNERS[corner][1]

      speeds[v] = dropSpeed
      lengths[v] = dropLength
      opacities[v] = dropOpacity
    }

    const base = drop * 4
    const i = drop * 6
    indices[i] = base
    indices[i + 1] = base + 1
    indices[i + 2] = base + 2
    indices[i + 3] = base
    indices[i + 4] = base + 2
    indices[i + 5] = base + 3
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aCorner', new THREE.BufferAttribute(corners, 2))
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
  geometry.setAttribute('aLength', new THREE.BufferAttribute(lengths, 1))
  geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1))
  geometry.setIndex(new THREE.BufferAttribute(indices, 1))

  return geometry
}

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uHeight;
  uniform float uWidth;
  uniform float uSlant;
  uniform vec3 uGlow;
  uniform float uGlowFalloff;

  attribute vec2 aCorner;
  attribute float aSpeed;
  attribute float aLength;
  attribute float aOpacity;

  varying float vOpacity;
  varying float vGlow;

  void main() {
    vec3 fallen = position;
    // Wrapping in the shader means drops recycle forever with no CPU respawn.
    fallen.y = mod(position.y - uTime * aSpeed, uHeight);

    vGlow = exp(-distance(fallen, uGlow) * uGlowFalloff);

    vec4 viewPosition = modelViewMatrix * vec4(fallen, 1.0);

    // Build the streak in view space so it always faces the camera. The lean
    // is applied to the quad rather than the drop's position, which avoids a
    // sideways jump each time one wraps back to the top.
    viewPosition.x += aCorner.x * uWidth + aCorner.y * aLength * uSlant;
    viewPosition.y += aCorner.y * aLength;

    float depth = -viewPosition.z;
    // Drops right at the lens would smear across the frame; distant ones should
    // dissolve rather than stipple.
    float nearFade = smoothstep(0.8, 3.5, depth);
    float farFade = 1.0 - smoothstep(15.0, 27.0, depth);
    // Fade out as they reach the ground, standing in for splashes we do not
    // simulate, and fade in at the top so nothing pops into existence.
    float groundFade = smoothstep(0.0, 1.6, fallen.y);
    float ceilingFade = 1.0 - smoothstep(uHeight - 3.0, uHeight, fallen.y);

    vOpacity = aOpacity * nearFade * farFade * groundFade * ceilingFade;

    gl_Position = projectionMatrix * viewPosition;
  }
`

const FRAGMENT = /* glsl */ `
  uniform vec3 uColour;
  uniform vec3 uGlowColour;

  varying float vOpacity;
  varying float vGlow;

  void main() {
    vec3 colour = mix(uColour, uGlowColour, clamp(vGlow, 0.0, 1.0));
    gl_FragColor = vec4(colour, vOpacity);
  }
`
