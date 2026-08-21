'use client'

import * as React from 'react'
import * as THREE from 'three'
import {
  ATLAS_SIZE,
  BLOB_RECT,
  LOGO_RECT,
  PHOSPHOR,
  SCREEN_RECT,
  SLIDES,
  type SlideTone
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
    // Deduped by image, since two slides pointing at the same artwork want the
    // same texture rather than two copies of a 1024px atlas.
    const slides = [
      ...new Map(SLIDES.map((slide) => [slide.image, slide.tone]))
    ].map(([image, tone]) => ({ image, tone }))

    Promise.all(slides.map((slide) => loadImage(slide.image)))
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
          const slide = slides[index]
          if (!artwork || !slide) return
          const texture = paint(emissiveOriginal, emissiveImage, (ctx) => {
            withClip(ctx, SCREEN_RECT, () => {
              fill(ctx, SCREEN_RECT, '#000000')
              drawPhosphor(ctx, artwork, slide.tone)
              drawScanlines(ctx)
              drawTubeFalloff(ctx)
            })
          })
          if (texture) emissive.set(slide.image, texture)
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
 * Turns a slide's artwork into glowing phosphor, by whichever of the two routes
 * its `tone` calls for. See SlideTone in config for why there are two.
 */
function drawPhosphor(
  ctx: CanvasRenderingContext2D,
  artwork: HTMLImageElement,
  tone: SlideTone
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

  if (tone === 'mask') {
    lctx.globalCompositeOperation = 'source-in'
    lctx.fillStyle = PHOSPHOR
    lctx.fillRect(0, 0, width, height)
  } else {
    tintToPhosphor(lctx, width, height)
  }

  ctx.drawImage(layer, x, y)
}

/** The phosphor as sRGB bytes, so the pixel loop below is plain arithmetic. */
const PHOSPHOR_RGB = [
  Number.parseInt(PHOSPHOR.slice(1, 3), 16),
  Number.parseInt(PHOSPHOR.slice(3, 5), 16),
  Number.parseInt(PHOSPHOR.slice(5, 7), 16)
] as const

/** Rec. 709 luma from sRGB bytes, normalised to 0..1. */
function luma709(r: number, g: number, b: number) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

/**
 * The phosphor scaled to a luma of exactly 1.
 *
 * Colour and brightness are kept strictly separate in tintToPhosphor, and this
 * is half of how: mixing two unit-luma colours gives another unit-luma colour,
 * so how much of the artwork's own hue is retained cannot change how hard a
 * pixel glows, and therefore cannot change what the composer blooms.
 */
const PHOSPHOR_CHROMA = PHOSPHOR_RGB.map(
  (channel) =>
    channel / 255 / luma709(PHOSPHOR_RGB[0], PHOSPHOR_RGB[1], PHOSPHOR_RGB[2])
)

/**
 * Curve applied to the artwork's brightness on its way to phosphor, and the
 * reason a photographic slide is legible at all.
 *
 * The screen runs at an emissive strength of 9.26 against a bloom threshold of
 * 1.05, so a mid-grey pixel still lands several times over it. Tinted linearly,
 * *every* pixel of a full-frame image breaches the threshold, the composer
 * flares all of them equally, and the slide reads as one glowing square with no
 * picture in it. Raising the curve drops the mid-tones back under the threshold
 * and leaves only the highlights to bloom, which is both legible and what a real
 * tube does: lit phosphor glows, unlit phosphor is dark glass.
 *
 * Tuned against the album artwork, which is dark with bright streetlamps. Lower
 * the gamma if a future slide comes out too murky to read.
 */
const TONE_GAMMA = 2.4

/** Ceiling on the brightest phosphor a full-frame slide may reach. */
const TONE_GAIN = 0.92

/**
 * How much of the artwork's own colour survives, from 0 for a pure amber
 * monochrome tube to 1 for the artwork's own hues at phosphor brightness.
 *
 * The dial to turn if the slides read too yellow or too photographic. It is safe
 * to turn freely: because both colours are normalised to unit luma before they
 * are mixed, this changes hue only, and never which pixels breach the bloom
 * threshold. Whatever legibility TONE_GAMMA buys is unaffected.
 */
const TONE_CHROMA = 0.6

/**
 * Remaps opaque artwork onto the phosphor.
 *
 * The artwork's luminance, curved by TONE_GAMMA, decides how hard each pixel
 * glows. Its hue is then blended toward the phosphor by TONE_CHROMA, so the
 * screen reads as a tube lit from behind rather than a photograph pasted onto
 * the glass, while still keeping the artwork's own colour in the highlights.
 *
 * Saturated colours can push a channel past full and clamp there. That is
 * intended: it reads as phosphor saturating, and the pixel's luma is correct
 * either way.
 *
 * Alpha is left alone, so artwork that *does* carry transparency still keeps its
 * shape rather than gaining a black box.
 */
function tintToPhosphor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const image = ctx.getImageData(0, 0, width, height)
  const pixels = image.data

  for (let i = 0; i < pixels.length; i += 4) {
    const luma = luma709(pixels[i], pixels[i + 1], pixels[i + 2])

    // Black stays black. Its hue is both meaningless and undefined to divide out.
    if (luma < 1 / 255) {
      pixels[i] = 0
      pixels[i + 1] = 0
      pixels[i + 2] = 0
      continue
    }

    const level = TONE_GAIN * luma ** TONE_GAMMA

    for (let channel = 0; channel < 3; channel++) {
      // The artwork's own colour, scaled to unit luma exactly as the phosphor
      // is, which is what makes the mix below a hue blend and nothing more.
      const own = pixels[i + channel] / 255 / luma
      pixels[i + channel] =
        (own * TONE_CHROMA + PHOSPHOR_CHROMA[channel] * (1 - TONE_CHROMA)) *
        level *
        255
    }
  }

  ctx.putImageData(image, 0, 0)
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
