'use client'

import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { PUDDLES } from './config'

type RipplesProps = {
  /** Wetness mask, so rings only ever appear on standing water. */
  mask: THREE.Texture
}

/**
 * Raindrops landing in the puddles.
 *
 * Entirely procedural: the shader hashes a grid of cells into drop positions and
 * phases and draws an expanding, fading ring in each. There are no particles, no
 * geometry per drop and nothing on the CPU but a time uniform — one transparent
 * plane over the water.
 *
 * This does more than decorate. The reflection alone left the puddles reading as
 * flat dark shapes; a moving surface is what actually tells you they are liquid.
 */
export function Ripples({ mask }: RipplesProps) {
  const materialRef = React.useRef<THREE.ShaderMaterial>(null)

  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uMask: { value: mask },
      // Pale warm, not the cold rim: blue rings on a red street read as an overlay.
      uColour: { value: new THREE.Color('#ffd2b4') },
      uOpacity: { value: 0.75 }
    }),
    [mask]
  )

  useFrame(({ clock }) => {
    const material = materialRef.current
    if (material) material.uniforms.uTime.value = clock.elapsedTime
  })

  return (
    // Barely above the water. The machine's base is at y=0, so this has to stay
    // tight to the contact plane or it draws over the bottom of it.
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0008, 0]}>
      <planeGeometry args={[PUDDLES.area, PUDDLES.area]} />
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

const VERTEX = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform sampler2D uMask;
  uniform vec3 uColour;
  uniform float uOpacity;

  varying vec2 vUv;

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  /**
   * One layer of rings on a grid. Drops sit near their cell's centre and the
   * rings stay inside it, so a single cell lookup is enough — sampling the eight
   * neighbours too would be nine times the cost for rings nobody would see.
   */
  float ringLayer(vec2 uv, float cells, float rate, float offset) {
    vec2 grid = uv * cells;
    vec2 cell = floor(grid);
    vec2 h = hash2(cell + offset);

    // Only some cells are ever active, which is what makes it read as light
    // rain rather than a boiling surface.
    if (h.y < 0.45) return 0.0;

    vec2 centre = cell + 0.5 + (h - 0.5) * 0.42;
    float d = distance(grid, centre);

    float phase = fract(uTime * rate + h.x * 6.28);
    float radius = phase * 0.42;
    float width = 0.02 + phase * 0.045;

    float ring =
      smoothstep(radius - width, radius, d) *
      (1.0 - smoothstep(radius, radius + width, d));

    // Rings weaken as they spread, the way a real impact loses energy.
    return ring * (1.0 - phase) * (1.0 - phase);
  }

  void main() {
    float wet = texture2D(uMask, vUv).r;
    if (wet < 0.03) discard;

    // Two layers at unrelated scales and rates, so the underlying grid does not
    // show as a pattern.
    float rings =
      ringLayer(vUv, 11.0, 0.55, 0.0) * 0.85 +
      ringLayer(vUv, 17.0, 0.38, 31.7) * 0.6;

    // Squared, so rings concentrate in the puddles and all but vanish on the
    // faintly damp street between them.
    gl_FragColor = vec4(uColour, clamp(rings, 0.0, 1.0) * uOpacity * wet * wet);
  }
`
