'use client'

import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { mulberry32 } from '../three/random'
import { RAIN } from './config'
import type { DoorBounds } from './Door'

/**
 * Rain falling on the door and nowhere else.
 *
 * Built like the CRT scene's Rain: every drop a camera-facing quad in one
 * geometry, all motion in the vertex shader from a single time uniform. Two
 * differences: the drops live in a narrow column over the door, thinning out at
 * its edges, and each one knows its own floor, so drops above the door's top
 * land on it instead of falling through. A second mesh over the same data draws
 * a splash at the moment each drop lands.
 */
export function DoorRain({ door }: { door: DoorBounds }) {
  const { streaks, splashes } = React.useMemo(() => buildGeometry(door), [door])

  React.useEffect(
    () => () => {
      streaks.dispose()
      splashes.dispose()
    },
    [streaks, splashes]
  )

  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uTop: { value: RAIN.top },
      uWidth: { value: RAIN.streakWidth },
      uSplashSeconds: { value: RAIN.splashSeconds },
      uColour: { value: new THREE.Color(RAIN.colour) }
    }),
    []
  )

  const streakMaterial = React.useRef<THREE.ShaderMaterial>(null)
  const splashMaterial = React.useRef<THREE.ShaderMaterial>(null)

  // Written through the materials, not `uniforms`: R3F copies each uniform into
  // the material, so writes to this object never reach the shader.
  useFrame(({ clock }) => {
    for (const material of [streakMaterial.current, splashMaterial.current]) {
      if (material) material.uniforms.uTime!.value = clock.elapsedTime
    }
  })

  return (
    <>
      {/* The shader moves every drop, so three's bounding sphere is meaningless. */}
      <mesh geometry={streaks} frustumCulled={false}>
        <shaderMaterial
          ref={streakMaterial}
          uniforms={uniforms}
          vertexShader={STREAK_VERTEX}
          fragmentShader={STREAK_FRAGMENT}
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={splashes} frustumCulled={false}>
        <shaderMaterial
          ref={splashMaterial}
          uniforms={uniforms}
          vertexShader={SPLASH_VERTEX}
          fragmentShader={SPLASH_FRAGMENT}
          transparent
          depthWrite={false}
        />
      </mesh>
    </>
  )
}

function buildGeometry(door: DoorBounds) {
  const { count, width, depth, top, speed, length, opacity, seed } = RAIN
  const random = mulberry32(seed)

  const positions = new Float32Array(count * 4 * 3)
  const corners = new Float32Array(count * 4 * 2)
  const floors = new Float32Array(count * 4)
  const speeds = new Float32Array(count * 4)
  const lengths = new Float32Array(count * 4)
  const opacities = new Float32Array(count * 4)
  const indices = new Uint32Array(count * 6)

  const CORNERS = [
    [-0.5, 0],
    [0.5, 0],
    [0.5, 1],
    [-0.5, 1]
  ]

  for (let drop = 0; drop < count; drop++) {
    // Two uniforms summed give a triangular spread: dense over the door, sparse
    // at the edges, so the column has no hard walls.
    const across = random() + random() - 1
    const along = random() + random() - 1
    const x = across * (width / 2)
    const z = along * (depth / 2)

    const onDoor =
      x > door.min.x && x < door.max.x && z > door.min.z && z < door.max.z
    const floor = onDoor ? door.max.y : 0

    const y = random() * (top - floor)
    const dropSpeed = speed.min + random() * (speed.max - speed.min)
    const dropLength = length.min + random() * (length.max - length.min)
    const edge = Math.max(Math.abs(across), Math.abs(along))
    const dropOpacity = opacity * (0.5 + random() * 0.5) * (1 - 0.6 * edge)

    for (let corner = 0; corner < 4; corner++) {
      const v = drop * 4 + corner
      positions[v * 3] = x
      positions[v * 3 + 1] = y
      positions[v * 3 + 2] = z
      corners[v * 2] = CORNERS[corner]![0]!
      corners[v * 2 + 1] = CORNERS[corner]![1]!
      floors[v] = floor
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

  const attributes = {
    position: new THREE.BufferAttribute(positions, 3),
    aCorner: new THREE.BufferAttribute(corners, 2),
    aFloor: new THREE.BufferAttribute(floors, 1),
    aSpeed: new THREE.BufferAttribute(speeds, 1),
    aLength: new THREE.BufferAttribute(lengths, 1),
    aOpacity: new THREE.BufferAttribute(opacities, 1)
  }
  const index = new THREE.BufferAttribute(indices, 1)

  const build = () => {
    const geometry = new THREE.BufferGeometry()
    for (const [name, attribute] of Object.entries(attributes)) {
      geometry.setAttribute(name, attribute)
    }
    geometry.setIndex(index)
    return geometry
  }

  return { streaks: build(), splashes: build() }
}

/** Shared by both meshes, so a splash fires exactly when its streak lands. */
const FALL = /* glsl */ `
  uniform float uTime;
  uniform float uTop;

  attribute vec2 aCorner;
  attribute float aFloor;
  attribute float aSpeed;
  attribute float aLength;
  attribute float aOpacity;

  // Height above the floor. Wrapping in the shader recycles drops forever.
  float fallen() {
    return mod(position.y - uTime * aSpeed, uTop - aFloor);
  }
`

const STREAK_VERTEX = /* glsl */ `
  ${FALL}
  uniform float uWidth;

  varying float vOpacity;
  varying vec2 vCorner;

  void main() {
    vec3 drop = vec3(position.x, aFloor + fallen(), position.z);
    vec4 viewPosition = modelViewMatrix * vec4(drop, 1.0);
    viewPosition.x += aCorner.x * uWidth;
    viewPosition.y += aCorner.y * aLength;

    // Drops appear out of the air rather than popping in at the top.
    float ceilingFade = 1.0 - smoothstep(uTop - 3.0, uTop, drop.y);
    vOpacity = aOpacity * ceilingFade;
    vCorner = aCorner;

    gl_Position = projectionMatrix * viewPosition;
  }
`

const STREAK_FRAGMENT = /* glsl */ `
  uniform vec3 uColour;

  varying float vOpacity;
  varying vec2 vCorner;

  void main() {
    // Soft across its width so a sub-pixel streak does not shimmer, and brightest
    // at the leading end.
    float across = 1.0 - abs(vCorner.x) * 2.0;
    float along = mix(1.0, 0.3, vCorner.y);
    gl_FragColor = vec4(uColour, vOpacity * across * along);
  }
`

const SPLASH_VERTEX = /* glsl */ `
  ${FALL}
  uniform float uSplashSeconds;

  varying float vOpacity;
  varying vec2 vCorner;

  void main() {
    // The drop wraps back to the top the instant it lands, so the distance it
    // has left to fall says how long ago that was.
    float age = (uTop - aFloor - fallen()) / aSpeed;
    float life = age / uSplashSeconds;

    float size = mix(0.03, 0.11, life);
    vec3 splash = vec3(position.x, aFloor + 0.02 + life * 0.05, position.z);
    vec4 viewPosition = modelViewMatrix * vec4(splash, 1.0);
    viewPosition.xy += vec2(aCorner.x, (aCorner.y - 0.5) * 0.55) * size;

    vOpacity = life < 1.0 ? aOpacity * (1.0 - life) * 1.4 : 0.0;
    vCorner = vec2(aCorner.x, aCorner.y - 0.5) * 2.0;

    gl_Position = projectionMatrix * viewPosition;
  }
`

const SPLASH_FRAGMENT = /* glsl */ `
  uniform vec3 uColour;

  varying float vOpacity;
  varying vec2 vCorner;

  void main() {
    if (vOpacity <= 0.0) discard;
    float blob = 1.0 - smoothstep(0.3, 1.0, length(vCorner));
    gl_FragColor = vec4(uColour, vOpacity * blob);
  }
`
