'use client'

import * as React from 'react'
import * as THREE from 'three'
import { mulberry32 } from '../three/random'
import { PALETTE } from './config'
import { heightAt } from './height'

/** Columns and rows of vertices. Spaced unevenly, so most of them sit near the door. */
const SEGMENTS = 300
const HALF_WIDTH = 420
const NEAR_Z = 45
const FAR_Z = -760

/**
 * One mesh for the field, the hills and the mountains.
 *
 * The grid is squeezed towards the door and the camera: cells are a fraction of
 * a unit across the crest and several units wide at the mountains, where fog
 * hides the coarseness. A uniform grid this size would facet the crest.
 */
export function Terrain() {
  const geometry = React.useMemo(() => buildGeometry(), [])
  const material = React.useMemo(() => buildMaterial(), [])

  React.useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  return <mesh geometry={geometry} material={material} receiveShadow />
}

/**
 * The grass, with a narrow footpath winding up to the door.
 *
 * The path is drawn per fragment from world position rather than baked into
 * the vertex colours: the grid is over a unit deep near the door, far too
 * coarse to hold an edge this narrow.
 */
function buildMaterial() {
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.95,
    metalness: 0
  })
  const pathColour = new THREE.Color(PALETTE.path)

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uPathColour = { value: pathColour }
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWorld;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;'
      )
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${PATH}`)
      .replace(
        '#include <color_fragment>',
        '#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, uPathColour, path(vWorld.xz));'
      )
  }

  return material
}

const PATH = /* glsl */ `
  uniform vec3 uPathColour;
  varying vec3 vWorld;

  // How much of this point is path, 0 to 1. The path runs from the camera's
  // side up to the door's front, swinging side to side less as it nears it.
  float path(vec2 p) {
    float z = p.y;
    float taper = smoothstep(0.4, 4.0, z);
    float centre = taper * (1.3 * sin(z * 0.45 - 0.2) + 0.35 * sin(z * 1.4 + 0.8));

    // Worn edges: the width wanders a little, so it reads as trodden, not laid.
    float halfWidth = 0.19 + 0.04 * sin(z * 3.1) + 0.04 * sin(z * 7.3 + p.x * 5.0);
    float edge = 1.0 - smoothstep(halfWidth - 0.08, halfWidth + 0.04, abs(p.x - centre));

    // Starts at the door's front step and nowhere behind it.
    return edge * smoothstep(0.35, 0.7, z) * 0.72;
  }
`

function buildGeometry() {
  const columns = SEGMENTS + 1
  const positions = new Float32Array(columns * columns * 3)
  const colours = new Float32Array(columns * columns * 3)
  const indices = new Uint32Array(SEGMENTS * SEGMENTS * 6)

  const light = new THREE.Color(PALETTE.grassLight)
  const dark = new THREE.Color(PALETTE.grassDark)
  const rock = new THREE.Color(PALETTE.rock)
  const colour = new THREE.Color()
  const random = mulberry32(31)

  for (let row = 0; row < columns; row++) {
    // Squared, so rows bunch up near the camera and the crest.
    const v = row / SEGMENTS
    const z = NEAR_Z + (FAR_Z - NEAR_Z) * v * v

    for (let column = 0; column < columns; column++) {
      const u = (column / SEGMENTS) * 2 - 1
      // Mostly squared, with a linear share so the centre column is not degenerate.
      const x = HALF_WIDTH * (0.08 * u + 0.92 * Math.sign(u) * u * u)
      const y = heightAt(x, z)

      const i = row * columns + column
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      // Long, soft patches of lighter and darker grass, finer clumps, and grain.
      const patch =
        0.5 +
        0.25 * Math.sin(x * 0.09 + z * 0.05) * Math.cos(z * 0.11 - x * 0.03) +
        0.15 * Math.sin(x * 0.8 + z * 0.3) * Math.sin(z * 0.9 - x * 0.4) +
        0.25 * (random() - 0.5)
      colour.copy(dark).lerp(light, Math.min(Math.max(patch, 0), 1))
      colour.lerp(rock, smoothstep(10, 30, y))

      colours[i * 3] = colour.r
      colours[i * 3 + 1] = colour.g
      colours[i * 3 + 2] = colour.b
    }
  }

  for (let row = 0; row < SEGMENTS; row++) {
    for (let column = 0; column < SEGMENTS; column++) {
      const a = row * columns + column
      const b = a + 1
      const c = a + columns
      const d = c + 1
      const i = (row * SEGMENTS + column) * 6
      // Wound so the faces point up, given rows run away from the camera.
      indices[i] = a
      indices[i + 1] = b
      indices[i + 2] = c
      indices[i + 3] = b
      indices[i + 4] = d
      indices[i + 5] = c
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colours, 3))
  geometry.setIndex(new THREE.BufferAttribute(indices, 1))
  geometry.computeVertexNormals()
  return geometry
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1)
  return t * t * (3 - 2 * t)
}
