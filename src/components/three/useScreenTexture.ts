'use client'

import * as React from 'react'
import * as THREE from 'three'
import {
  ATLAS_SIZE,
  LOGO_RECT,
  LOGO_URL,
  PHOSPHOR,
  SCREEN_RECT
} from './config'

type ScreenMaps = {
  emissive: THREE.CanvasTexture
  base: THREE.CanvasTexture
}

/**
 * Repaints the CRT so it shows the band logo as glowing phosphor instead of the
 * baked DOS file manager.
 *
 * Two maps have to change, not one. The emissive map supplies the glow, but
 * emission is *added* to the base colour, so leaving the base alone leaves the
 * original blue screen and its grime showing through underneath the amber.
 *
 * Both repaints draw the original texture first and only overwrite the screen
 * rect, which keeps the rest of the atlas — including the thin edge-glow sliver
 * below the screen — exactly as authored.
 */
export function useScreenMaps(
  emissiveSource: THREE.Texture | null,
  baseSource: THREE.Texture | null
) {
  const [maps, setMaps] = React.useState<ScreenMaps | null>(null)

  React.useEffect(() => {
    // Held in locals so the narrowing survives into the async callback below.
    const emissiveOriginal = emissiveSource
    const baseOriginal = baseSource
    const emissiveImage = emissiveOriginal?.image as
      CanvasImageSource | undefined
    const baseImage = baseOriginal?.image as CanvasImageSource | undefined

    if (!emissiveOriginal || !emissiveImage || !baseOriginal || !baseImage) {
      return
    }

    let cancelled = false
    const logo = new Image()
    logo.src = LOGO_URL

    logo
      .decode()
      .then(() => {
        if (cancelled) return

        const emissive = paint(emissiveOriginal, emissiveImage, (ctx) => {
          clearScreen(ctx, '#000000')
          drawPhosphorLogo(ctx, logo)
          drawScanlines(ctx)
          drawTubeFalloff(ctx)
        })

        const base = paint(baseOriginal, baseImage, (ctx) => {
          // Near-black rather than pure black: an unlit CRT is dark grey glass,
          // and a true zero here would flatten the bezel's inner edge.
          clearScreen(ctx, '#060607')
        })

        if (!emissive || !base) return
        setMaps({ emissive, base })
      })
      .catch(() => {
        // A missing logo should cost us the repaint, not the whole scene: the
        // baked DOS screen stays and still lights everything correctly.
      })

    return () => {
      cancelled = true
    }
  }, [emissiveSource, baseSource])

  React.useEffect(
    () => () => {
      maps?.emissive.dispose()
      maps?.base.dispose()
    },
    [maps]
  )

  return maps
}

function paint(
  source: THREE.Texture,
  image: CanvasImageSource,
  draw: (ctx: CanvasRenderingContext2D) => void
) {
  const canvas = document.createElement('canvas')
  canvas.width = ATLAS_SIZE
  canvas.height = ATLAS_SIZE

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.drawImage(image, 0, 0, ATLAS_SIZE, ATLAS_SIZE)

  const { x, y, width, height } = SCREEN_RECT
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, width, height)
  ctx.clip()
  draw(ctx)
  ctx.restore()

  const texture = new THREE.CanvasTexture(canvas)
  // glTF textures are authored top-down and GLTFLoader disables the flip to
  // match. The replacement has to agree or the screen renders upside down.
  texture.flipY = false
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = source.wrapS
  texture.wrapT = source.wrapT
  texture.anisotropy = source.anisotropy
  texture.needsUpdate = true

  return texture
}

function clearScreen(ctx: CanvasRenderingContext2D, colour: string) {
  const { x, y, width, height } = SCREEN_RECT
  ctx.fillStyle = colour
  ctx.fillRect(x, y, width, height)
}

/**
 * The logo is light artwork on transparency, so its alpha is already the glyph
 * mask. Compositing a flat fill through that alpha recolours it to phosphor
 * without touching the black around it.
 */
function drawPhosphorLogo(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement
) {
  const { x, y, width, height } = LOGO_RECT

  const inset = 0.84
  const scale = Math.min(
    (width * inset) / logo.width,
    (height * inset) / logo.height
  )
  const w = logo.width * scale
  const h = logo.height * scale

  const layer = document.createElement('canvas')
  layer.width = width
  layer.height = height

  const lctx = layer.getContext('2d')
  if (!lctx) return

  lctx.drawImage(logo, (width - w) / 2, (height - h) / 2, w, h)
  lctx.globalCompositeOperation = 'source-in'
  lctx.fillStyle = PHOSPHOR
  lctx.fillRect(0, 0, width, height)

  ctx.drawImage(layer, x, y)
}

/** Alternating dark rows. Subtle at this texel density, but it kills the flatness. */
function drawScanlines(ctx: CanvasRenderingContext2D) {
  const { x, y, width, height } = SCREEN_RECT

  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = 'rgba(0, 0, 0, 0.34)'
  for (let row = 0; row < height; row += 3) {
    ctx.fillRect(x, y + row, width, 1)
  }
  ctx.globalCompositeOperation = 'source-over'
}

/** Phosphor tubes are brighter at the centre and fall away toward the bezel. */
function drawTubeFalloff(ctx: CanvasRenderingContext2D) {
  const { x, y, width, height } = SCREEN_RECT
  const cx = x + width / 2
  const cy = y + height / 2

  const gradient = ctx.createRadialGradient(
    cx,
    cy,
    Math.min(width, height) * 0.15,
    cx,
    cy,
    Math.max(width, height) * 0.72
  )
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.55)')

  ctx.globalCompositeOperation = 'multiply'
  ctx.fillStyle = gradient
  ctx.fillRect(x, y, width, height)
  ctx.globalCompositeOperation = 'source-over'
}
