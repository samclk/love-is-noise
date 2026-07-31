'use client'

import * as React from 'react'
import * as THREE from 'three'
import {
  ATLAS_SIZE,
  BLOB_RECT,
  LOGO_RECT,
  PHOSPHOR,
  SCREEN_RECT,
  SLIDES
} from './config'

type Rect = { x: number; y: number; width: number; height: number }

export type ScreenMaps = {
  /** Shared by every slide: the base colour only ever blacks the tube out. */
  base: THREE.CanvasTexture
  /** One emissive map per distinct slide image, keyed by its URL. */
  emissive: Map<string, THREE.CanvasTexture>
}

/**
 * Repaints the CRT so it shows the band's artwork as glowing phosphor instead of
 * the baked DOS file manager, and builds one map per slide up front.
 *
 * Two maps have to change, not one. The emissive map supplies the glow, but
 * emission is *added* to the base colour, so leaving the base alone leaves the
 * original blue screen and its grime showing through underneath the amber. Only
 * the emissive differs between slides, so the base is built once.
 *
 * Every slide is painted at load rather than on demand. Repainting a 1024px
 * atlas mid-cycle would stall the frame the swap lands on, which is exactly the
 * moment the eye is on the screen.
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
    const urls = [...new Set(SLIDES.map((slide) => slide.image))]

    Promise.all(urls.map(loadImage))
      .then((artworks) => {
        if (cancelled) return

        const base = paint(baseOriginal, baseImage, (ctx) => {
          // Near-black rather than pure black: an unlit CRT is dark grey glass,
          // and a true zero here would flatten the bezel's inner edge.
          withClip(ctx, SCREEN_RECT, () => fill(ctx, SCREEN_RECT, '#060607'))
          // The grime above the screen, covered separately so the main wipe can
          // stay clear of the bezel's corners.
          withClip(ctx, BLOB_RECT, () => fill(ctx, BLOB_RECT, '#060607'))
        })
        if (!base) return

        const emissive = new Map<string, THREE.CanvasTexture>()
        artworks.forEach((artwork, index) => {
          if (!artwork) return
          const texture = paint(emissiveOriginal, emissiveImage, (ctx) => {
            withClip(ctx, SCREEN_RECT, () => {
              fill(ctx, SCREEN_RECT, '#000000')
              drawPhosphor(ctx, artwork)
              drawScanlines(ctx)
              drawTubeFalloff(ctx)
            })
          })
          if (texture) emissive.set(urls[index] as string, texture)
        })

        if (!emissive.size) return
        setMaps({ base, emissive })
      })
      .catch(() => {
        // Missing artwork should cost us the repaint, not the whole scene: the
        // baked DOS screen stays and still lights everything correctly.
      })

    return () => {
      cancelled = true
    }
  }, [emissiveSource, baseSource])

  React.useEffect(
    () => () => {
      maps?.base.dispose()
      maps?.emissive.forEach((texture) => texture.dispose())
    },
    [maps]
  )

  return maps
}

function loadImage(url: string) {
  const image = new Image()
  image.src = url
  return image.decode().then(() => image)
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
  // Clipping is left to each draw op: the base map covers two separate regions
  // of the atlas, so a single clip here would shut the second one out.
  draw(ctx)

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

function withClip(ctx: CanvasRenderingContext2D, rect: Rect, draw: () => void) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(rect.x, rect.y, rect.width, rect.height)
  ctx.clip()
  draw()
  ctx.restore()
}

function fill(ctx: CanvasRenderingContext2D, rect: Rect, colour: string) {
  ctx.fillStyle = colour
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
}

/**
 * Every slide is light artwork on transparency, so its alpha is already the
 * glyph mask. Compositing a flat fill through that alpha recolours it to
 * phosphor without touching the black around it.
 */
function drawPhosphor(
  ctx: CanvasRenderingContext2D,
  artwork: HTMLImageElement
) {
  const { x, y, width, height } = LOGO_RECT

  const inset = 0.84
  const scale = Math.min(
    (width * inset) / artwork.width,
    (height * inset) / artwork.height
  )
  const w = artwork.width * scale
  const h = artwork.height * scale

  const layer = document.createElement('canvas')
  layer.width = width
  layer.height = height

  const lctx = layer.getContext('2d')
  if (!lctx) return

  lctx.drawImage(artwork, (width - w) / 2, (height - h) / 2, w, h)
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
