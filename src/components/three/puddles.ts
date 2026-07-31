'use client'

import * as THREE from 'three'
import { PUDDLES } from './config'
import { mulberry32 } from './random'

/**
 * Builds the floor's wet-ground maps: irregular puddle patches scattered around
 * the machine.
 *
 * Two textures come off the same layout. The roughness map is what does the
 * work — three reads its green channel and multiplies it into the material's
 * roughness, so black patches become near-mirror while white stays dry gravel.
 * The colour map only darkens the same patches, because wet ground is darker
 * than dry.
 *
 * Both are generated once and reused; nothing here runs per frame.
 */
export function createPuddleMaps() {
  const layout = buildLayout()

  return {
    roughnessMap: render(layout, {
      background: '#ffffff',
      // Not pure black: a perfect mirror looks like glass rather than water.
      centre: 'rgba(14, 14, 14, 1)',
      edge: 'rgba(14, 14, 14, 0)'
    }),
    colourMap: render(layout, {
      background: '#100f0d',
      centre: 'rgba(4, 5, 7, 1)',
      edge: 'rgba(4, 5, 7, 0)'
    }),
    /**
     * How wet the ground is, which becomes the reflective layer's alpha.
     *
     * Not a straight cut-out. Discrete black puddles punched into a glowing red
     * street read as holes in it, where the artwork has the whole road wet with
     * puddles as the strongest patches. So the base is a gentle sheen fading out
     * with distance, and the puddles go to full mirror on top of it.
     */
    maskMap: render(
      layout,
      {
        background: '#000000',
        centre: 'rgba(255, 255, 255, 1)',
        edge: 'rgba(255, 255, 255, 0)'
      },
      // Only a faint sheen off the puddles. Higher than this and the whole
      // street becomes one wet sheet, which erases the patches entirely.
      { falloff: true, falloffAlpha: 0.12 }
    ),
    /**
     * Emissive mask for the red street.
     *
     * This cannot just reuse the roughness map. That one is white everywhere
     * outside the puddles, which would run the red flat to the horizon and end
     * on a hard edge where the floor stops — and fading *it* out instead would
     * turn the distant ground into a mirror. So the wash gets its own map, with
     * a radial falloff to black well inside the plane, and the puddles punched
     * out so standing water reflects the street rather than emitting it.
     */
    washMap: render(
      layout,
      {
        background: '#000000',
        centre: 'rgba(0, 0, 0, 1)',
        edge: 'rgba(0, 0, 0, 0)'
      },
      { falloff: true, colorSpace: THREE.SRGBColorSpace }
    ),
    /**
     * The same wash with the puddles left in.
     *
     * The dry floor needs its puddles punched out so they stay dark enough to
     * mirror, but the water layer needs the opposite: with no emissive of its
     * own and only a dark sky to reflect, it came out pure black. This lets the
     * street's red sit in the water underneath the reflection.
     */
    glowMap: render(
      [],
      {
        background: '#000000',
        centre: 'rgba(0, 0, 0, 1)',
        edge: 'rgba(0, 0, 0, 0)'
      },
      { falloff: true, colorSpace: THREE.SRGBColorSpace }
    )
  }
}

type Puddle = {
  x: number
  y: number
  radius: number
  seed: number
}

function buildLayout(): Puddle[] {
  const random = mulberry32(PUDDLES.seed)
  const { resolution, area, count } = PUDDLES
  const pixelsPerUnit = resolution / area
  const centre = resolution / 2

  return Array.from({ length: count }, () => {
    // Clustered close in, so water sits right around the machine's base where
    // it has something worth reflecting. Scattering them wide left mostly empty
    // air above each puddle, and the reflections came back black.
    const angle = random() * Math.PI * 2
    const distance = 1.1 + random() ** 0.7 * 5.6
    const radius = 0.5 + random() * 1.5

    return {
      x: centre + Math.cos(angle) * distance * pixelsPerUnit,
      y: centre + Math.sin(angle) * distance * pixelsPerUnit * 0.72,
      radius: radius * pixelsPerUnit,
      seed: random() * Math.PI * 2
    }
  })
}

function render(
  layout: Puddle[],
  colours: { background: string; centre: string; edge: string },
  options: {
    falloff?: boolean
    /** Peak strength of the falloff, so a map can wet the ground only partly. */
    falloffAlpha?: number
    colorSpace?: THREE.ColorSpace
  } = {}
) {
  const { resolution, area } = PUDDLES

  const canvas = document.createElement('canvas')
  canvas.width = resolution
  canvas.height = resolution

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = colours.background
  ctx.fillRect(0, 0, resolution, resolution)

  if (options.falloff) {
    // Reaches zero before the plane's edge, so clamping past the map gives
    // unlit ground rather than a red field running to the horizon.
    const centre = resolution / 2
    const gradient = ctx.createRadialGradient(
      centre,
      centre,
      resolution * 0.04,
      centre,
      centre,
      resolution * 0.46
    )
    const peak = options.falloffAlpha ?? 1
    gradient.addColorStop(0, `rgba(255, 255, 255, ${peak})`)
    gradient.addColorStop(0.4, `rgba(255, 255, 255, ${peak * 0.78})`)
    gradient.addColorStop(0.78, `rgba(255, 255, 255, ${peak * 0.22})`)
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, resolution, resolution)
  }

  for (const puddle of layout) {
    drawPuddle(ctx, puddle, colours)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = options.colorSpace ?? THREE.NoColorSpace
  // The map covers only the area around the machine. Clamping means everything
  // beyond it takes the (dry) edge pixel instead of tiling puddles to infinity.
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.needsUpdate = true

  return { texture, area }
}

function drawPuddle(
  ctx: CanvasRenderingContext2D,
  { x, y, radius, seed }: Puddle,
  colours: { centre: string; edge: string }
) {
  // Layered harmonics rather than a circle, so the outlines look like standing
  // water finding the low ground instead of stamped dots.
  const steps = 64
  ctx.beginPath()
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2
    const wobble =
      1 +
      0.24 * Math.sin(angle * 2 + seed) +
      0.13 * Math.sin(angle * 3 - seed * 1.7) +
      0.07 * Math.sin(angle * 5 + seed * 2.3)
    const r = radius * wobble
    const px = x + Math.cos(angle) * r
    const py = y + Math.sin(angle) * r * 0.78

    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()

  // Soft margin so puddles dry out at their edges rather than ending abruptly.
  const gradient = ctx.createRadialGradient(
    x,
    y,
    radius * 0.1,
    x,
    y,
    radius * 1.2
  )
  gradient.addColorStop(0, colours.centre)
  gradient.addColorStop(0.72, colours.centre)
  gradient.addColorStop(1, colours.edge)

  ctx.fillStyle = gradient
  ctx.fill()
}
