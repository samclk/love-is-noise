'use client'

import * as THREE from 'three'
import { mulberry32 } from './random'

/**
 * Seamlessly tiling fbm value noise, generated once into a texture.
 *
 * Tiling is the whole point: the fog layers scroll forever across this, so any
 * seam would sweep visibly through the scene. Each octave's lattice wraps modulo
 * its own period, which makes the result repeat exactly at the texture edge.
 *
 * Generated on the CPU rather than sampled procedurally in the shader — the fog
 * covers a lot of screen, and one texture fetch is far cheaper per fragment than
 * several octaves of hashing.
 */
export function createNoiseTexture(size = 256, octaves = 5, seed = 1) {
  const random = mulberry32(seed)
  const field = new Float32Array(size * size)

  let amplitude = 1
  let total = 0

  for (let octave = 0; octave < octaves; octave++) {
    // Lattice cells across the texture. Doubling per octave keeps every octave
    // an exact divisor of the texture, which is what preserves the tiling.
    const period = 4 << octave
    const lattice = new Float32Array(period * period)
    for (let i = 0; i < lattice.length; i++) lattice[i] = random()

    for (let y = 0; y < size; y++) {
      const fy = (y / size) * period
      const yFloor = Math.floor(fy)
      const y0 = yFloor % period
      const y1 = (y0 + 1) % period
      const ty = smooth(fy - yFloor)

      for (let x = 0; x < size; x++) {
        const fx = (x / size) * period
        const xFloor = Math.floor(fx)
        const x0 = xFloor % period
        const x1 = (x0 + 1) % period
        const tx = smooth(fx - xFloor)

        const top = lerp(
          lattice[y0 * period + x0] ?? 0,
          lattice[y0 * period + x1] ?? 0,
          tx
        )
        const bottom = lerp(
          lattice[y1 * period + x0] ?? 0,
          lattice[y1 * period + x1] ?? 0,
          tx
        )

        field[y * size + x] += lerp(top, bottom, ty) * amplitude
      }
    }

    total += amplitude
    amplitude *= 0.5
  }

  const data = new Uint8Array(size * size * 4)
  for (let i = 0; i < size * size; i++) {
    const value = Math.round(((field[i] ?? 0) / total) * 255)
    data[i * 4] = value
    data[i * 4 + 1] = value
    data[i * 4 + 2] = value
    data[i * 4 + 3] = 255
  }

  const texture = new THREE.DataTexture(data, size, size)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true

  return texture
}

/** Smoothstep easing between lattice points — the classic value-noise curve. */
function smooth(t: number) {
  return t * t * (3 - 2 * t)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
