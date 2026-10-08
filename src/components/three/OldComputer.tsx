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
  POWER_OFF,
  PROMPT,
  REJECT,
  SPILL
} from './config'
import { useScreenTexture, type ScreenFrame } from './useScreenTexture'

// RectAreaLight needs its lookup textures built before first use, otherwise it
// contributes nothing at all. Safe at module scope because this file only ever
// loads in the browser.
RectAreaLightUniformsLib.init()

type OldComputerProps = {
  reducedMotion: boolean
  /** Reports where the screen ended up, so the rain can catch its light. */
  onScreenMeasured?: (centre: THREE.Vector3) => void
  /** Fires once the CRT is showing the prompt rather than the baked DOS screen. */
  onReady?: () => void
  /** What has been typed at the prompt so far. */
  text: string
  /** Each increment dips the tube once, the only response a wrong answer gets. */
  rejections: number
  /** Switches the tube off. There is no way back on. */
  off: boolean
  /** Fires once the tube has gone fully dark. */
  onPoweredOff?: () => void
}

export function OldComputer({
  reducedMotion,
  onScreenMeasured,
  onReady,
  text,
  rejections,
  off,
  onPoweredOff
}: OldComputerProps) {
  const { scene } = useGLTF(MODEL_URL)
  const lightRef = React.useRef<THREE.RectAreaLight>(null)

  const { model, screenMaterial, screen } = React.useMemo(
    () => prepareModel(scene),
    [scene]
  )

  // Captured once: the effect below swaps our own maps onto this material, and
  // reading them back on the next render would rebuild the atlas every keystroke.
  const originals = React.useMemo(
    () => ({
      emissive: screenMaterial?.emissiveMap ?? null,
      base: screenMaterial?.map ?? null
    }),
    [screenMaterial]
  )
  const painted = useScreenTexture(originals.emissive, originals.base)

  // Emissive strength is authored in the GLB (9.26 via
  // KHR_materials_emissive_strength) and is the baseline the flicker rides on.
  const baseEmissive = React.useMemo(
    () => screenMaterial?.emissiveIntensity ?? 1,
    [screenMaterial]
  )

  React.useEffect(() => {
    if (screen) onScreenMeasured?.(screen.centre)
  }, [screen, onScreenMeasured])

  React.useEffect(() => {
    if (!screenMaterial || !painted) return
    screenMaterial.map = painted.base
    screenMaterial.emissiveMap = painted.emissive
    screenMaterial.needsUpdate = true

    // The repaint is the last thing to land: it waits on the prompt's webfont,
    // which sits outside three's loading manager and finishes after progress
    // has already reported complete. Revealing on progress alone would show the
    // baked blue DOS screen for a moment before it popped to the prompt.
    onReady?.()
  }, [screenMaterial, painted, onReady])

  /** The last frame painted, so the canvas is only touched when it changes. */
  const lastPainted = React.useRef('')
  /** When the text last changed, so the cursor holds solid while typing. */
  const typedAt = React.useRef(0)
  /** Milliseconds into a rejection dip, or null when there is none. */
  const dipping = React.useRef<number | null>(null)
  /** Milliseconds since the tube was switched off, or null while it is on. */
  const poweringOff = React.useRef<number | null>(null)
  const poweredOff = React.useRef(false)

  React.useEffect(() => {
    typedAt.current = performance.now()
  }, [text])

  // A new canvas starts blank, whatever was last painted onto the old one.
  React.useEffect(() => {
    lastPainted.current = ''
  }, [painted])

  React.useEffect(() => {
    if (rejections > 0) dipping.current = 0
  }, [rejections])

  React.useEffect(() => {
    if (off && poweringOff.current === null) poweringOff.current = 0
  }, [off])

  const paint = (frame: ScreenFrame) => {
    const key = JSON.stringify(frame)
    if (!painted || key === lastPainted.current) return
    lastPainted.current = key
    painted.paint(frame)
  }

  useFrame(({ clock }, delta) => {
    const light = lightRef.current
    const ms = delta * 1000

    if (poweringOff.current !== null) {
      poweringOff.current += ms
      const { brightness, collapse } = reducedMotion
        ? { brightness: 0, collapse: { x: 0, y: 0 } }
        : powerOff(poweringOff.current)

      paint({ text, cursor: false, collapse })
      if (screenMaterial) {
        screenMaterial.emissiveIntensity = baseEmissive * brightness
      }
      // The room goes dark as the picture does, not as the leftover dot does:
      // a line or a dot throws almost no light.
      if (light) light.intensity = SPILL_INTENSITY * collapse.y

      if (brightness === 0 && !poweredOff.current) {
        poweredOff.current = true
        onPoweredOff?.()
      }
      return
    }

    const now = performance.now()
    // Solid while typing and under reduced motion, blinking at rest.
    const cursor =
      reducedMotion ||
      now - typedAt.current < PROMPT.blinkMs ||
      Math.floor(now / PROMPT.blinkMs) % 2 === 0
    paint({ text, cursor })

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
    const dip = advanceDip(ms)

    if (screenMaterial) {
      screenMaterial.emissiveIntensity = baseEmissive * factor * dip
    }
    // The spill has to move with the screen, or the light and its source
    // visibly disagree — including through the dip, so the room darkens with
    // the tube when it rejects an answer.
    if (light) light.intensity = SPILL_INTENSITY * factor * dip
  })

  /**
   * The brightness multiplier for a rejection dip: a V from full to almost-out
   * and back. Not quite to zero, since a hard cut to black reads as a fault.
   */
  function advanceDip(ms: number) {
    if (dipping.current === null) return 1
    dipping.current += ms
    const progress = Math.min(dipping.current / REJECT.dipMs, 1)
    if (progress >= 1) {
      dipping.current = null
      return 1
    }
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
    </>
  )
}

const SPILL_INTENSITY = 7

/**
 * Where the power-off is, `elapsed` milliseconds in: how much of the picture is
 * left on each axis, and how bright the tube still is.
 */
function powerOff(elapsed: number) {
  const { squashMs, shrinkMs, fadeMs } = POWER_OFF
  // Ease-in: deflection fails slowly and then all at once.
  const ease = (value: number) => Math.min(1, Math.max(0, value)) ** 2

  const squash = ease(elapsed / squashMs)
  const shrink = ease((elapsed - squashMs) / shrinkMs)
  const fade = ease((elapsed - squashMs - shrinkMs) / fadeMs)

  return {
    collapse: { x: 1 - shrink, y: 1 - squash },
    brightness: 1 - fade
  }
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
