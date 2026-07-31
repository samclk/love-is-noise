'use client'

import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { HAZE } from './config'

type HazeProps = {
  reducedMotion: boolean
}

/**
 * Volumetric haze around the machine.
 *
 * Distance fog alone is flat — it dims everything by depth and nothing more.
 * This layers soft billboard puffs through the scene instead, so some sit
 * behind the machine and some veil in front of it, and moving the camera
 * parallaxes between them. That separation is what actually reads as depth.
 *
 * Alpha blended rather than additive: haze should lift the blacks and eat
 * contrast, where additive would only add glow. One geometry, one draw call,
 * drift computed in the vertex shader from a time uniform.
 */
export function Haze({ reducedMotion }: HazeProps) {
  const materialRef = React.useRef<THREE.ShaderMaterial>(null)

  const geometry = React.useMemo(() => buildGeometry(), [])

  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uColour: { value: new THREE.Color(HAZE.colour) },
      uOpacity: { value: HAZE.opacity },
      uDrift: { value: reducedMotion ? 0 : 1 }
    }),
    [reducedMotion]
  )

  React.useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(({ clock }) => {
    const material = materialRef.current
    if (material) material.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    // The puffs are repositioned in the shader, so three's bounding sphere is
    // meaningless and culling has to be off.
    <mesh geometry={geometry} frustumCulled={false} renderOrder={1}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

function buildGeometry() {
  const { count, radius, height, size, opacity } = HAZE

  const positions = new Float32Array(count * 4 * 3)
  const corners = new Float32Array(count * 4 * 2)
  const sizes = new Float32Array(count * 4 * 2)
  const phases = new Float32Array(count * 4)
  const opacities = new Float32Array(count * 4)
  const indices = new Uint32Array(count * 6)

  const CORNERS = [
    [-0.5, -0.5],
    [0.5, -0.5],
    [0.5, 0.5],
    [-0.5, 0.5]
  ]

  for (let puff = 0; puff < count; puff++) {
    const angle = Math.random() * Math.PI * 2
    const distance = Math.sqrt(Math.random()) * radius
    const x = Math.cos(angle) * distance
    const z = Math.sin(angle) * distance
    // Weighted low: haze pools near the ground rather than filling the sky.
    const y = height.min + Math.random() ** 1.8 * (height.max - height.min)

    // Wider than tall, so puffs read as drifting layers rather than blobs.
    const width = size.min + Math.random() * (size.max - size.min)
    const tall = width * (0.42 + Math.random() * 0.3)

    const phase = Math.random() * Math.PI * 2
    const puffOpacity = opacity * (0.5 + Math.random() * 0.5)

    for (let corner = 0; corner < 4; corner++) {
      const v = puff * 4 + corner

      positions[v * 3] = x
      positions[v * 3 + 1] = y
      positions[v * 3 + 2] = z

      corners[v * 2] = CORNERS[corner][0]
      corners[v * 2 + 1] = CORNERS[corner][1]

      sizes[v * 2] = width
      sizes[v * 2 + 1] = tall

      phases[v] = phase
      opacities[v] = puffOpacity
    }

    const base = puff * 4
    const i = puff * 6
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
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 2))
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1))
  geometry.setIndex(new THREE.BufferAttribute(indices, 1))

  return geometry
}

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uDrift;

  attribute vec2 aCorner;
  attribute vec2 aSize;
  attribute float aPhase;
  attribute float aOpacity;

  varying vec2 vLocal;
  varying float vOpacity;

  void main() {
    vec3 centre = position;
    // Very slow, unsynchronised drift. Fast enough to never look frozen, slow
    // enough that you cannot watch it move.
    centre.x += sin(uTime * 0.055 + aPhase) * 1.7 * uDrift;
    centre.z += cos(uTime * 0.041 + aPhase * 1.7) * 1.2 * uDrift;
    centre.y += sin(uTime * 0.03 + aPhase * 2.3) * 0.35 * uDrift;

    vec4 viewPosition = modelViewMatrix * vec4(centre, 1.0);
    // Offsetting in view space billboards the quad for free — it always faces
    // the camera with no per-frame CPU work.
    viewPosition.xy += aCorner * aSize;

    float depth = -viewPosition.z;
    // Puffs at the lens would grey out the whole frame; distant ones are
    // already handled by the scene's own fog.
    float nearFade = smoothstep(1.5, 6.0, depth);
    float farFade = 1.0 - smoothstep(26.0, 44.0, depth);

    vLocal = aCorner;
    vOpacity = aOpacity * nearFade * farFade;

    gl_Position = projectionMatrix * viewPosition;
  }
`

const FRAGMENT = /* glsl */ `
  uniform vec3 uColour;
  uniform float uOpacity;

  varying vec2 vLocal;
  varying float vOpacity;

  void main() {
    // Soft round falloff, raised to a power so the edges are gone well before
    // the quad's border — that is what stops the billboards showing as squares
    // where they cut through the ground.
    float d = length(vLocal) * 2.0;
    float a = 1.0 - smoothstep(0.0, 1.0, d);
    a = pow(a, 2.4);

    gl_FragColor = vec4(uColour, a * vOpacity * uOpacity);
  }
`
