'use client'

import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import {
  FLICKER,
  MODEL_SIZE,
  MODEL_URL,
  SLIDES,
  SLIDESHOW,
  SPILL,
  type SlideAction
} from './config'
import { useScreenMaps } from './useScreenTexture'

// RectAreaLight needs its lookup textures built before first use, otherwise it
// contributes nothing at all. Safe at module scope because this file only ever
// loads in the browser.
RectAreaLightUniformsLib.init()

type OldComputerProps = {
  reducedMotion: boolean
  /** Reports where the screen ended up, so the rain can catch its light. */
  onScreenMeasured?: (centre: THREE.Vector3) => void
  /** Fires once the CRT is showing the logo rather than the baked DOS screen. */
  onReady?: () => void
  /** Handed the screen's action when the glass is clicked. */
  onActivate?: (action: SlideAction) => void
  /** Holds the cycle, e.g. while a dialog the screen opened is still up. */
  paused?: boolean
}

export function OldComputer({
  reducedMotion,
  onScreenMeasured,
  onReady,
  onActivate,
  paused
}: OldComputerProps) {
  const { scene } = useGLTF(MODEL_URL)
  const lightRef = React.useRef<THREE.RectAreaLight>(null)

  const { model, screenMaterial, screen } = React.useMemo(
    () => prepareModel(scene),
    [scene]
  )

  const painted = useScreenMaps(
    screenMaterial?.emissiveMap ?? null,
    screenMaterial?.map ?? null
  )

  // Emissive strength is authored in the GLB (9.26 via
  // KHR_materials_emissive_strength) and is the baseline the flicker rides on.
  const baseEmissive = React.useMemo(
    () => screenMaterial?.emissiveIntensity ?? 1,
    [screenMaterial]
  )

  React.useEffect(() => {
    if (screen) onScreenMeasured?.(screen.centre)
  }, [screen, onScreenMeasured])

  /** Index of the slide currently burned into the tube. */
  const slide = React.useRef(0)
  /** Milliseconds the current slide has been held. */
  const held = React.useRef(0)
  /** Milliseconds into a swap, or null when the screen is settled. */
  const swapping = React.useRef<number | null>(null)
  const swapped = React.useRef(false)
  /** Where a press began, so a drag can be told apart from a tap. */
  const pressedAt = React.useRef<{ x: number; y: number } | null>(null)
  /** Whether the pointer is on the glass, so the cursor can follow the cycle. */
  const hovering = React.useRef(false)

  // Restored on unmount so a cursor set over the glass cannot outlive the scene.
  React.useEffect(() => () => setCursor(null), [])

  /**
   * The cursor tracks the cycle, not just the pointer: the slide under a resting
   * pointer changes every couple of seconds, and half of them are inert.
   */
  const refreshCursor = React.useCallback(() => {
    const interactive = Boolean(SLIDES[slide.current]?.action)
    setCursor(hovering.current && interactive ? 'pointer' : null)
  }, [])

  const showSlide = React.useCallback(
    (index: number) => {
      const artwork = SLIDES[index]?.image
      const texture = artwork ? painted?.emissive.get(artwork) : null
      if (!screenMaterial || !texture) return
      // No needsUpdate here on purpose: swapping one texture for another in a
      // slot that already had one needs no shader recompile, and forcing one
      // every four seconds would hitch the frame the swap lands on.
      screenMaterial.emissiveMap = texture
    },
    [painted, screenMaterial]
  )

  React.useEffect(() => {
    if (!screenMaterial || !painted) return
    screenMaterial.map = painted.base
    showSlide(slide.current)
    // Only here: this is the one point where the maps genuinely change identity
    // from the model's originals to ours.
    screenMaterial.needsUpdate = true

    // The repaint is the last thing to land: the artwork is plain Images, so it
    // sits outside three's loading manager and finishes after progress has
    // already reported complete. Revealing on progress alone would show the
    // baked blue DOS screen for a moment before it popped to the logo.
    onReady?.()
  }, [screenMaterial, painted, showSlide, onReady])

  useFrame(({ clock }, delta) => {
    const light = lightRef.current

    if (reducedMotion) {
      if (screenMaterial) screenMaterial.emissiveIntensity = baseEmissive
      if (light) light.intensity = SPILL_INTENSITY
      return
    }

    // Layering slow sines of unrelated periods gives an unsettled drift with no
    // audible beat to it, and never a hard step in brightness.
    const t = clock.elapsedTime
    const drift = FLICKER.frequencies.reduce(
      (total, frequency, index) =>
        total + Math.sin(t * frequency + index * 1.9) / (index + 1),
      0
    )
    const factor = 1 + drift * FLICKER.amplitude
    const dip = advanceSlideshow(delta)

    if (screenMaterial) {
      screenMaterial.emissiveIntensity = baseEmissive * factor * dip
    }
    // The spill has to move with the screen, or the light and its source
    // visibly disagree — including through the dip, so the room darkens with
    // the tube when it changes slide.
    if (light) light.intensity = SPILL_INTENSITY * factor * dip
  })

  /**
   * Runs the cycle and returns the brightness multiplier for this frame.
   *
   * The swap happens at the bottom of a dim, the way a CRT behaves when it
   * changes input, so the slide is never seen changing — only the tube dropping
   * out and coming back with something else on it.
   */
  function advanceSlideshow(delta: number) {
    const { holdMs, dipMs } = SLIDESHOW
    const ms = delta * 1000

    if (swapping.current === null) {
      if (!paused) held.current += ms
      if (held.current >= holdMs && painted) {
        swapping.current = 0
        swapped.current = false
      }
      return 1
    }

    swapping.current += ms
    const progress = Math.min(swapping.current / dipMs, 1)

    if (progress >= 0.5 && !swapped.current) {
      slide.current = (slide.current + 1) % SLIDES.length
      showSlide(slide.current)
      refreshCursor()
      swapped.current = true
    }

    if (progress >= 1) {
      swapping.current = null
      held.current = 0
      return 1
    }

    // A V from full to almost-out and back. Not quite to zero: a tube retains a
    // little glow, and a hard cut to black reads as a fault rather than a change.
    return 0.05 + 0.95 * Math.abs(progress * 2 - 1)
  }

  return (
    <>
      <primitive object={model} />

      {/*
        Emissive materials do not illuminate anything in three.js — there is no
        global illumination — so the screen's glow has to be a real light,
        matched to the glass panel's measured size and position.
      */}
      {screen && (
        <rectAreaLight
          ref={lightRef}
          position={[screen.centre.x, screen.centre.y, screen.centre.z + 0.02]}
          width={screen.width}
          height={screen.height}
          color={SPILL}
          intensity={SPILL_INTENSITY}
          // Aim it out of the tube, along the direction the glass faces.
          onUpdate={(self) =>
            self.lookAt(screen.centre.x, screen.centre.y, screen.centre.z + 1)
          }
        />
      )}

      {/*
        The click target. An invisible plane on the glass rather than handlers on
        the model itself, because the screen shares a mesh with the whole case —
        a hit on that mesh cannot tell the tube from the keyboard. The glass was
        already measured for the spill light, so its bounds come free.
      */}
      {screen && (
        <mesh
          position={[screen.centre.x, screen.centre.y, screen.centre.z + 0.03]}
          onPointerOver={(event) => {
            event.stopPropagation()
            hovering.current = true
            refreshCursor()
          }}
          onPointerOut={() => {
            hovering.current = false
            refreshCursor()
            // Left the glass mid-press: no longer a tap on it.
            pressedAt.current = null
          }}
          onPointerDown={(event) => {
            event.stopPropagation()
            pressedAt.current = { x: event.clientX, y: event.clientY }
          }}
          onPointerUp={(event) => {
            event.stopPropagation()
            const from = pressedAt.current
            pressedAt.current = null
            if (!from) return

            // The glass is both the click target and the biggest thing to
            // grab, so without this every drag from mid-frame opened the link.
            const travelled = Math.hypot(
              event.clientX - from.x,
              event.clientY - from.y
            )
            if (travelled > TAP_SLOP) return

            // The logo slides swallow the click rather than sending it wherever
            // the cycle happens to have moved on to.
            const action = SLIDES[slide.current]?.action
            if (!action) return

            // Handed out to the DOM rather than acted on here: opening a tab
            // belongs in the document, not in a render loop.
            onActivate?.(action)
          }}
        >
          <planeGeometry args={[screen.width, screen.height]} />
          {/* Fully transparent, but still raycast: only `visible` is consulted. */}
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </>
  )
}

const SPILL_INTENSITY = 7

/**
 * How far a press may travel and still count as a tap, in CSS pixels.
 *
 * Generous, because a thumb on glass never holds still — anything tighter and
 * real taps get rejected as drags.
 */
const TAP_SLOP = 14

/**
 * The only affordance the screen has, so it is set on the document rather than
 * the canvas — R3F's own cursor handling does not survive the pointer moving
 * between meshes cleanly enough to rely on here.
 */
function setCursor(cursor: 'pointer' | null) {
  document.body.style.cursor = cursor ?? ''
}

type PreparedModel = {
  model: THREE.Object3D
  screenMaterial: THREE.MeshStandardMaterial | null
  screen: { centre: THREE.Vector3; width: number; height: number } | null
}

/**
 * Normalises the Sketchfab export into world units and pulls out the two things
 * the scene needs to reference: the screen's material and the glass panel's
 * bounds.
 */
function prepareModel(scene: THREE.Object3D): PreparedModel {
  const model = scene.clone(true)

  // useGLTF caches by URL, so the materials arriving here are shared. Cloning
  // them keeps our emissive repaint and flicker local to this instance.
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    object.material = Array.isArray(object.material)
      ? object.material.map((material) => material.clone())
      : object.material.clone()
    object.castShadow = true
    object.receiveShadow = true
  })

  // The export is ~72 units across and sits off-origin, so rescale to a known
  // size, centre it horizontally and drop it onto the floor plane.
  const bounds = new THREE.Box3().setFromObject(model)
  const size = bounds.getSize(new THREE.Vector3())
  const centre = bounds.getCenter(new THREE.Vector3())
  const scale = MODEL_SIZE / Math.max(size.x, size.y, size.z)

  model.scale.setScalar(scale)
  model.position.set(
    -centre.x * scale,
    -groundLevel(model) * scale,
    -centre.z * scale
  )
  model.updateMatrixWorld(true)

  let screenMaterial: THREE.MeshStandardMaterial | null = null
  let glass: THREE.Mesh | null = null

  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const material = object.material
    if (Array.isArray(material)) return

    if (material.name === 'Old_Computer') {
      screenMaterial = material as THREE.MeshStandardMaterial
    }
    if (material.name === 'Glass') {
      glass = object
    }
  })

  return {
    model,
    screenMaterial,
    screen: glass ? measureScreen(glass) : null
  }
}

/**
 * Where the machine actually rests, which is not its lowest vertex.
 *
 * The bounding box bottoms out at the mouse cable, which droops well below the
 * casing — about 120 of 9,387 vertices trail down there. Grounding on that
 * floated the whole machine a visible gap above the floor, with its shadow and
 * reflection stranded underneath it.
 *
 * Taking a low percentile instead ignores dangling geometry and lands on the
 * real footprint. Erring slightly low is deliberate: sinking a hair into the
 * ground is invisible, whereas hovering above it is not.
 */
function groundLevel(model: THREE.Object3D) {
  const heights: number[] = []
  const vertex = new THREE.Vector3()

  model.updateMatrixWorld(true)
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const position = object.geometry.getAttribute('position')

    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i).applyMatrix4(object.matrixWorld)
      heights.push(vertex.y)
    }
  })

  if (!heights.length) return 0

  heights.sort((a, b) => a - b)
  return heights[Math.floor(heights.length * 0.02)] ?? heights[0] ?? 0
}

/**
 * Measuring the glass rather than hardcoding coordinates means the spill light
 * stays correct if the model's scale or framing is ever retuned.
 */
function measureScreen(glass: THREE.Mesh) {
  const bounds = new THREE.Box3().setFromObject(glass)
  const size = bounds.getSize(new THREE.Vector3())

  return {
    centre: bounds.getCenter(new THREE.Vector3()),
    width: size.x,
    height: size.y
  }
}

useGLTF.preload(MODEL_URL)
