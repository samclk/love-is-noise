'use client'

import * as React from 'react'
import * as THREE from 'three'
import { ATLAS_SIZE, BLOB_RECT, SCREEN_RECT } from './config'

type Rect = { x: number; y: number; width: number; height: number }

type ScreenMaps = {
  base: THREE.CanvasTexture
  emissive: THREE.CanvasTexture
}

/**
 * Blacks the baked DOS file manager out of the tube so the clip has an unlit
 * screen to play on.
 *
 * Two maps have to change, not one. Clearing the emissive alone kills the glow
 * but leaves the original blue screen and its grime in the base colour, still
 * lit by the rest of the rig. Clearing the base alone leaves the DOS screen
 * glowing. Both go dark, and ScreenVideo puts the light back.
 */
export function useScreenMaps(source: {
  base: THREE.Texture | null
  emissive: THREE.Texture | null
}): ScreenMaps | null {
  const [maps, setMaps] = React.useState<ScreenMaps | null>(null)

  const { base: baseSource, emissive: emissiveSource } = source

  React.useEffect(() => {
    const emissiveOriginal = emissiveSource
    const baseOriginal = baseSource
    const emissiveImage = emissiveOriginal?.image as
      CanvasImageSource | undefined
    const baseImage = baseOriginal?.image as CanvasImageSource | undefined

    if (!emissiveOriginal || !emissiveImage || !baseOriginal || !baseImage) {
      return
    }

    // Near-black rather than pure black: an unlit CRT is dark grey glass, and a
    // true zero here would flatten the bezel's inner edge.
    const base = paint(baseOriginal, baseImage, (ctx) => blank(ctx, '#060607'))
    // The emissive genuinely does go to zero. Anything left here is added on
    // top of the clip and shows as a lit rectangle behind it.
    const emissive = paint(emissiveOriginal, emissiveImage, (ctx) =>
      blank(ctx, '#000000')
    )

    if (!base || !emissive) return
    setMaps({ base, emissive })
  }, [emissiveSource, baseSource])

  React.useEffect(
    () => () => {
      maps?.base.dispose()
      maps?.emissive.dispose()
    },
    [maps]
  )

  return maps
}

/**
 * Covers the screen and the patch of case grime above it, which the screen quad
 * also samples — left alone it shows through in the screen's top-left corner.
 */
function blank(ctx: CanvasRenderingContext2D, colour: string) {
  fill(ctx, SCREEN_RECT, colour)
  fill(ctx, BLOB_RECT, colour)
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

function fill(ctx: CanvasRenderingContext2D, rect: Rect, colour: string) {
  ctx.fillStyle = colour
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
}
