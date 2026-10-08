'use client'

import * as React from 'react'
import * as THREE from 'three'
import { terminalFont } from '@/components/terminalFont'
import {
  ATLAS_SIZE,
  BLOB_RECT,
  CONTENT_RECT,
  PHOSPHOR,
  SCREEN_RECT
} from './config'

type Rect = { x: number; y: number; width: number; height: number }

/** What the tube shows on a given paint. */
export type ScreenFrame = {
  text: string
  cursor: boolean
  /** The character the cursor sits on. */
  cursorAt: number
  /**
   * How much of the picture is left during power-off, per axis, from 1 for the
   * full screen to 0 for nothing. Absent while the tube is on normally.
   */
  collapse?: { x: number; y: number }
}

export type Screen = {
  base: THREE.CanvasTexture
  emissive: THREE.CanvasTexture
  paint: (frame: ScreenFrame) => void
}

/**
 * Repaints the CRT so it shows a terminal prompt as glowing phosphor instead of
 * the baked DOS file manager.
 *
 * Two maps have to change, not one. The emissive map supplies the glow, but
 * emission is *added* to the base colour, so leaving the base alone leaves the
 * original blue screen and its grime showing through underneath the amber.
 *
 * The emissive canvas is kept and repainted in place, one clip of the atlas at a
 * time, so a keystroke or a cursor blink costs one texture upload and no new
 * allocations.
 */
export function useScreenTexture(
  emissiveSource: THREE.Texture | null,
  baseSource: THREE.Texture | null
) {
  const [screen, setScreen] = React.useState<Screen | null>(null)

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
    const family = terminalFont.style.fontFamily

    // A fallback face drawn before the real one lands would sit on the tube
    // until the next keystroke or blink, so the first paint waits for it.
    document.fonts
      .load(`${FONT_SIZE}px ${family}`)
      .catch((error) => {
        // The fallback face is ugly but legible; better than a dead screen.
        console.warn('screen: prompt font failed to load', error)
      })
      .then(() => {
        if (cancelled) return

        const base = paint(baseOriginal, baseImage, (ctx) => {
          // Near-black rather than pure black: an unlit CRT is dark grey glass,
          // and a true zero here would flatten the bezel's inner edge.
          withClip(ctx, SCREEN_RECT, () => fill(ctx, SCREEN_RECT, '#060607'))
          // The grime above the screen, covered separately so the main wipe can
          // stay clear of the bezel's corners.
          withClip(ctx, BLOB_RECT, () => fill(ctx, BLOB_RECT, '#060607'))
        })
        const emissive = paint(emissiveOriginal, emissiveImage, () => {})
        if (!base || !emissive) return

        const canvas = emissive.image as HTMLCanvasElement
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const draw = (frame: ScreenFrame) => {
          withClip(ctx, SCREEN_RECT, () => {
            fill(ctx, SCREEN_RECT, '#000000')
            if (frame.collapse) drawCollapse(ctx, frame.collapse)
            else drawPrompt(ctx, family, frame)
            drawScanlines(ctx)
            drawTubeFalloff(ctx)
          })
          emissive.needsUpdate = true
        }

        draw({ text: '', cursor: true, cursorAt: 0 })
        setScreen({ base, emissive, paint: draw })
      })

    return () => {
      cancelled = true
    }
  }, [emissiveSource, baseSource])

  React.useEffect(
    () => () => {
      screen?.base.dispose()
      screen?.emissive.dispose()
    },
    [screen]
  )

  return screen
}

/** VT323 is fixed-width, so one advance measures every glyph. */
const FONT_SIZE = 34

const LINE_HEIGHT = 1.25

/** Inset from the content box, so the prompt does not sit on the tube's curve. */
const PADDING = 26

function drawPrompt(
  ctx: CanvasRenderingContext2D,
  family: string,
  { text, cursor, cursorAt }: ScreenFrame
) {
  const { x, y } = CONTENT_RECT

  ctx.font = `${FONT_SIZE}px ${family}`
  ctx.textBaseline = 'top'
  ctx.fillStyle = PHOSPHOR

  const left = x + PADDING
  const lineTop = (line: number) => y + PADDING + FONT_SIZE * LINE_HEIGHT * line
  text.split('\n').forEach((line, index) => {
    ctx.fillText(line, left, lineTop(index))
  })

  if (cursor) {
    // The cursor's line is however many breaks come before it.
    const before = text.slice(0, cursorAt).split('\n')
    const column = before[before.length - 1] ?? ''
    const at = left + ctx.measureText(column).width
    const advance = ctx.measureText('0').width
    ctx.fillRect(at, lineTop(before.length - 1), advance, FONT_SIZE * 0.85)
  }
}

/**
 * The picture squashing to a line and the line to a dot, which is what a tube
 * does as its deflection dies. The beam is still on, so what is left gets
 * brighter as it shrinks rather than dimmer; the fade is OldComputer's job.
 */
function drawCollapse(
  ctx: CanvasRenderingContext2D,
  collapse: { x: number; y: number }
) {
  const { x, y, width, height } = CONTENT_RECT
  const w = Math.max(3, width * collapse.x)
  const h = Math.max(2, height * collapse.y)

  ctx.globalAlpha = Math.min(1, 0.25 + (1 - collapse.y) * 0.75)
  ctx.fillStyle = '#fff4d6'
  ctx.fillRect(x + (width - w) / 2, y + (height - h) / 2, w, h)
  ctx.globalAlpha = 1
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
