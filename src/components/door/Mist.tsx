'use client'

import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { createNoiseTexture } from '../three/noise'
import { mulberry32 } from '../three/random'
import { MIST } from './config'

type Layer = {
  z: number
  width: number
  scale: number
  speed: [number, number]
  opacity: number
}

/**
 * Low mist lying in the valleys, as a stack of drifting noise planes.
 *
 * The same approach as the CRT scene's FogLayers, kept close to the ground and
 * paler. The planes skip the slice of depth the door stands in, since a plane
 * through solid geometry cuts a hard line across it.
 */
export function Mist({ reducedMotion }: { reducedMotion: boolean }) {
  const texture = React.useMemo(() => createNoiseTexture(256, 5, MIST.seed), [])
  React.useEffect(() => () => texture.dispose(), [texture])

  const layers = React.useMemo(() => buildLayers(), [])

  return (
    <>
      {layers.map((layer, index) => (
        <MistLayer
          key={index}
          layer={layer}
          texture={texture}
          reducedMotion={reducedMotion}
        />
      ))}
    </>
  )
}

function MistLayer({
  layer,
  texture,
  reducedMotion
}: {
  layer: Layer
  texture: THREE.Texture
  reducedMotion: boolean
}) {
  const materialRef = React.useRef<THREE.ShaderMaterial>(null)

  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uMap: { value: texture },
      uColour: { value: new THREE.Color(MIST.colour) },
      uOpacity: { value: layer.opacity },
      uScale: { value: layer.scale },
      uSpeed: { value: new THREE.Vector2(...layer.speed) },
      uDrift: { value: reducedMotion ? 0 : 1 }
    }),
    [texture, layer, reducedMotion]
  )

  useFrame(({ clock }) => {
    const material = materialRef.current
    if (material) material.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    <mesh position={[0, HEIGHT / 2 - 6, layer.z]}>
      <planeGeometry args={[layer.width, HEIGHT]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        transparent
        depthWrite={false}
        fog={false}
      />
    </mesh>
  )
}

const HEIGHT = 16

function buildLayers(): Layer[] {
  const random = mulberry32(MIST.seed)
  const layers: Layer[] = []

  // All behind the crest. One in front cut a hard line where it met the slope.
  const depths = [-90, -60, -38, -22, -12, -5].slice(0, MIST.count)
  for (const z of depths) {
    const width = Math.max((30 - z) * 1.4, 60)
    layers.push({
      z,
      width,
      scale: width / 40,
      speed: [
        (0.003 + random() * 0.006) * (random() < 0.5 ? -1 : 1),
        (0.001 + random() * 0.002) * (random() < 0.5 ? -1 : 1)
      ],
      opacity: MIST.opacity * (0.6 + random() * 0.4)
    })
  }

  return layers
}

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying float vDepth;
  varying float vWorldY;

  void main() {
    vUv = uv;
    vWorldY = (modelMatrix * vec4(position, 1.0)).y;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vDepth = -viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;
  }
`

const FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform sampler2D uMap;
  uniform vec3 uColour;
  uniform float uOpacity;
  uniform float uScale;
  uniform vec2 uSpeed;
  uniform float uDrift;

  varying vec2 vUv;
  varying float vDepth;
  varying float vWorldY;

  void main() {
    vec2 drift = fract(uSpeed * uTime * uDrift);
    float a = texture2D(uMap, vUv * vec2(uScale, uScale * 0.35) + drift).r;
    float b = texture2D(uMap, vUv * vec2(uScale, uScale * 0.35) * 2.1 - drift * 1.4).r;
    float density = smoothstep(0.3, 0.8, a * 0.6 + b * 0.4);

    float edgeX = smoothstep(0.0, 0.2, vUv.x) * (1.0 - smoothstep(0.8, 1.0, vUv.x));
    // Thick in the valleys below the crest, thinning to nothing a few units up.
    float vertical = smoothstep(-6.0, -2.0, vWorldY) * (1.0 - smoothstep(0.5, 6.0, vWorldY));
    float near = smoothstep(4.0, 12.0, vDepth);

    float alpha = density * edgeX * vertical * near * uOpacity;
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(uColour, alpha);
  }
`
