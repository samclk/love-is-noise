'use client'

import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { FOG_LAYERS } from './config'
import { createNoiseTexture } from './noise'
import { mulberry32 } from './random'

type FogLayersProps = {
  /** Low tier thins the stack — the layers are cheap in geometry but pay in fill. */
  quality: 'high' | 'low'
  reducedMotion: boolean
}

/**
 * Volumetric smoke, as a stack of scrolling noise planes.
 *
 * Each plane is a big transparent quad sampling the same tiling noise at its own
 * scale, drifting at its own speed, and fading at its edges and with depth.
 * Individually they read as flat texture; stacked through the scene at different
 * depths they parallax against each other as the camera moves, and the eye reads
 * that separation as volume. It is the cheap approximation to a raymarched
 * volume, and it is what most sites doing this well actually use.
 *
 * The planes deliberately skip the band of depth the machine occupies. A plane
 * intersecting solid geometry cuts a hard straight line across it, which is the
 * usual giveaway with this technique.
 */
export function FogLayers({ quality, reducedMotion }: FogLayersProps) {
  const texture = React.useMemo(
    () => createNoiseTexture(256, 5, FOG_LAYERS.seed),
    []
  )

  React.useEffect(() => () => texture.dispose(), [texture])

  const layers = React.useMemo(
    () =>
      buildLayers(quality === 'low' ? FOG_LAYERS.lowCount : FOG_LAYERS.count),
    [quality]
  )

  return (
    <>
      {layers.map((layer, index) => (
        <FogLayer
          key={index}
          layer={layer}
          texture={texture}
          reducedMotion={reducedMotion}
        />
      ))}
    </>
  )
}

type Layer = {
  z: number
  y: number
  width: number
  height: number
  scale: number
  speed: [number, number]
  opacity: number
}

function FogLayer({
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
      uColourHigh: { value: new THREE.Color(FOG_LAYERS.colourHigh) },
      uColourLow: { value: new THREE.Color(FOG_LAYERS.colourLow) },
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
    <mesh position={[0, layer.y, layer.z]}>
      <planeGeometry args={[layer.width, layer.height]} />
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

/**
 * Depth at which the camera sits, near enough. Used to size each plane so it
 * covers roughly the same slice of frame regardless of how far back it is.
 */
const CAMERA_Z = 9.1

function buildLayers(count: number): Layer[] {
  const random = mulberry32(FOG_LAYERS.seed)
  const layers: Layer[] = []

  // Most of the stack sits behind the machine, with a couple in front to veil
  // it. The gap between the two ranges is the space the machine occupies.
  const behind = Math.max(1, Math.round(count * 0.75))
  const front = Math.max(1, count - behind)

  const place = (z: number) => {
    const distance = CAMERA_Z - z
    // Generously oversized, and the same vertical extent on every layer so the
    // world-height gradient lands identically on all of them. Anything outside
    // the frustum is clipped before it costs a fragment, so being wasteful with
    // the near planes is free.
    const width = Math.max(distance * 1.7, 34)
    const height = 26

    layers.push({
      z,
      // Centred high, with the gradient deciding what is actually visible.
      y: 8,
      width,
      height,
      // Scaled with the plane so noise features stay a consistent world size
      // rather than getting coarser the further back the layer is.
      scale: width / 26,
      speed: [
        (0.004 + random() * 0.01) * (random() < 0.5 ? -1 : 1),
        (0.0015 + random() * 0.004) * (random() < 0.5 ? -1 : 1)
      ],
      opacity: FOG_LAYERS.opacity * (0.55 + random() * 0.45)
    })
  }

  for (let i = 0; i < behind; i++) {
    place(lerp(-24, -3.5, behind === 1 ? 0.5 : i / (behind - 1)))
  }
  // Just clear of the machine, but no closer: the near fade thins anything this
  // side of it, and pushing them further forward removed them entirely.
  for (let i = 0; i < front; i++) {
    place(lerp(2.4, 4.6, front === 1 ? 0 : i / (front - 1)))
  }

  return layers
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying float vDepth;
  varying float vWorldY;

  void main() {
    vUv = uv;
    // Height in world units, not UV. The layers are different sizes, so a fade
    // expressed in UV lands at a different altitude on each one — which put the
    // smoke in the sky on the big rear planes instead of around the machine.
    vWorldY = (modelMatrix * vec4(position, 1.0)).y;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vDepth = -viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;
  }
`

const FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform sampler2D uMap;
  uniform vec3 uColourHigh;
  uniform vec3 uColourLow;
  uniform float uOpacity;
  uniform float uScale;
  uniform vec2 uSpeed;
  uniform float uDrift;

  varying vec2 vUv;
  varying float vDepth;
  varying float vWorldY;

  void main() {
    // fract keeps the scroll offset bounded. Left to grow, it would eventually
    // lose float precision and the noise would visibly quantise.
    vec2 drift = fract(uSpeed * uTime * uDrift);

    // Two samples at different rates, so the layer churns rather than sliding
    // as one rigid sheet.
    float a = texture2D(uMap, vUv * uScale + drift).r;
    float b = texture2D(uMap, vUv * uScale * 1.9 - drift * 1.6).r;
    float density = a * 0.65 + b * 0.35;

    // Bias toward the thinner end, so the layers read as wisps with gaps rather
    // than a uniform sheet of grey.
    density = smoothstep(0.35, 0.85, density);

    // Fade the sides to nothing, or the plane's own rectangle shows.
    float edgeX = smoothstep(0.0, 0.22, vUv.x) * (1.0 - smoothstep(0.78, 1.0, vUv.x));

    // Driven by world height so every layer fades at the same altitude no
    // matter its size: gone at the ground, building through the height of the
    // machine so it wraps the screen, thinning out well above it.
    float ground = smoothstep(-0.2, 3.0, vWorldY);
    float ceiling = 1.0 - smoothstep(9.0, 17.0, vWorldY);
    float vertical = ground * ceiling;

    // Nothing right at the lens, nothing lost in the far dark. The near range is
    // tight because the layers in front of the machine are only a few units from
    // the camera, and a wider fade erased them completely.
    float near = smoothstep(1.2, 4.0, vDepth);
    float far = 1.0 - smoothstep(24.0, 40.0, vDepth);

    float alpha = density * edgeX * vertical * near * far * uOpacity;
    if (alpha < 0.002) discard;

    // Grey where it reads against the sky, sinking to near-black as it nears
    // the floor, so it dissolves into the ground rather than laying a pale film
    // over it.
    vec3 colour = mix(uColourLow, uColourHigh, smoothstep(0.0, 5.5, vWorldY));

    gl_FragColor = vec4(colour, alpha);
  }
`
