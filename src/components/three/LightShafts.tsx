'use client'

import * as React from 'react'
import * as THREE from 'three'
import { SHAFT } from './config'

type Shaft = {
  position: [number, number, number]
  rotation: [number, number, number]
  /** Spread at the ground. The narrow end's ratio is baked into the geometry. */
  radius: number
  height: number
  opacity: number
}

/**
 * The streetlamp beams from the artwork, as additive cones.
 *
 * A real volumetric pass would mean marching the scene per pixel; a screen-space
 * god-ray effect would mean another full-resolution pass. Neither is worth it
 * for two static beams, so these are open-ended cones whose edges fade out by
 * view angle — the same trick that makes a cone read as a shaft of lit air
 * rather than a solid object. Two meshes, no passes, no per-frame work.
 */
export function LightShafts() {
  const geometry = React.useMemo(() => {
    // One cone, reused by both shafts via instanced-in-spirit sharing: same
    // geometry object, different transforms.
    return new THREE.CylinderGeometry(0.18, 1, 1, 24, 1, true)
  }, [])

  React.useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <>
      {SHAFTS.map((shaft, index) => (
        <mesh
          key={index}
          geometry={geometry}
          position={shaft.position}
          rotation={shaft.rotation}
          scale={[shaft.radius, shaft.height, shaft.radius]}
          renderOrder={2}
        >
          <ShaftMaterial opacity={shaft.opacity} />
        </mesh>
      ))}
    </>
  )
}

/** Angled inward from either side, echoing the two lamps in the artwork. */
const SHAFTS: Shaft[] = [
  {
    position: [-5.4, 5.6, 1.4],
    rotation: [0, 0, 0.3],
    radius: 1.9,
    height: 7,
    opacity: 0.32
  },
  {
    position: [5.8, 5.9, -0.6],
    rotation: [0, 0, -0.26],
    radius: 1.7,
    height: 7.4,
    opacity: 0.25
  }
]

function ShaftMaterial({ opacity }: { opacity: number }) {
  return (
    <shaderMaterial
      args={[
        {
          uniforms: {
            uColour: { value: new THREE.Color(SHAFT) },
            uOpacity: { value: opacity }
          },
          vertexShader: VERTEX,
          fragmentShader: FRAGMENT,
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
        }
      ]}
    />
  )
}

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vUv = uv;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-viewPosition.xyz);
    gl_Position = projectionMatrix * viewPosition;
  }
`

const FRAGMENT = /* glsl */ `
  uniform vec3 uColour;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    // Surfaces edge-on to the camera sit at the cone's silhouette and must fade
    // to nothing; surfaces facing us are looking down the length of the beam
    // and carry the most lit air.
    float facing = abs(dot(normalize(vNormal), normalize(vView)));
    float body = pow(facing, 1.7);

    // Brightest at the lamp and gone entirely by the wide end. Fading only to a
    // quarter left the broad bottoms of the cones spread across the horizon as a
    // bright band the width of the frame.
    float vertical = smoothstep(0.0, 0.9, vUv.y);
    vertical *= vertical;
    float cap = 1.0 - smoothstep(0.94, 1.0, vUv.y);

    gl_FragColor = vec4(uColour, body * vertical * cap * uOpacity);
  }
`
