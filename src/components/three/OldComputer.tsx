'use client'

import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { FLICKER, MODEL_SIZE, MODEL_URL, SPILL } from './config'
import { ScreenVideo } from './ScreenVideo'
import { useScreenMaps } from './useScreenMaps'

// RectAreaLight needs its lookup textures built before first use, otherwise it
// contributes nothing at all. Safe at module scope because this file only ever
// loads in the browser.
RectAreaLightUniformsLib.init()

type OldComputerProps = {
  reducedMotion: boolean
  /** Reports where the screen ended up, so the rain can catch its light. */
  onScreenMeasured?: (centre: THREE.Vector3) => void
  /** Fires once the tube is blanked rather than showing the baked DOS screen. */
  onReady?: () => void
  /** The clip the tube plays. Null until the element mounts. */
  video: HTMLVideoElement | null
  /** Play/pause, for a click on the glass. */
  onToggleVideo: () => void
}

export function OldComputer({
  reducedMotion,
  onScreenMeasured,
  onReady,
  video,
  onToggleVideo
}: OldComputerProps) {
  const { scene } = useGLTF(MODEL_URL)
  const lightRef = React.useRef<THREE.RectAreaLight>(null)
  /** The clip's material, so the flicker can drive its brightness. */
  const videoMaterial = React.useRef<THREE.ShaderMaterial>(null)

  const { model, screenMaterial, screenSource, screen } = React.useMemo(
    () => prepareModel(scene),
    [scene]
  )

  // The model's own maps, not the material's current ones. Reading the material
  // here feeds this hook the textures its own result is about to be assigned to,
  // so the first re-render after that assignment repaints from the repaint, and
  // every render after that does it again.
  const painted = useScreenMaps(screenSource)

  // Emissive strength is authored in the GLB (9.26 via
  // KHR_materials_emissive_strength) and is the baseline the flicker rides on.
  const baseEmissive = React.useMemo(
    () => screenMaterial?.emissiveIntensity ?? 1,
    [screenMaterial]
  )

  React.useEffect(() => {
    if (screen) onScreenMeasured?.(screen.centre)
  }, [screen, onScreenMeasured])

  /** Where a press began, so a drag can be told apart from a tap. */
  const pressedAt = React.useRef<{ x: number; y: number } | null>(null)

  // Restored on unmount so a cursor set over the glass cannot outlive the scene.
  React.useEffect(() => () => setCursor(null), [])

  React.useEffect(() => {
    if (!screenMaterial || !painted) return
    screenMaterial.map = painted.base
    screenMaterial.emissiveMap = painted.emissive
    // The one point where the maps genuinely change identity from the model's
    // originals to ours, so the one place a recompile is owed.
    screenMaterial.needsUpdate = true

    // The blanking is the last thing to land: it runs off the model's own
    // textures once they have decoded, which is after three's loading manager
    // has already reported complete. Revealing on progress alone would show the
    // baked blue DOS screen for a moment before it went dark.
    onReady?.()
  }, [screenMaterial, painted, onReady])

  /** How far the spill has followed the tube, 0 for dark and 1 for lit. */
  const lit = React.useRef(0)

  useFrame(({ clock }, delta) => {
    const light = lightRef.current
    const material = videoMaterial.current

    // The clip's own state, read straight off the element. Threading it through
    // React would re-render the whole scene twice per press to move a number
    // this loop is already reading every frame.
    const target = video && !video.paused ? 1 : 0
    // Eased rather than cut, so pressing play brings the room up the way a tube
    // warms rather than throwing a switch. Framerate-independent.
    lit.current += (target - lit.current) * (1 - Math.exp(-SPILL_RAMP * delta))
    const glow = SPILL_FLOOR + (1 - SPILL_FLOOR) * lit.current

    if (reducedMotion) {
      if (material) material.uniforms.uIntensity.value = baseEmissive
      if (light) light.intensity = SPILL_INTENSITY * glow
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

    // The tube and its spill ride the same number, or the light and its source
    // visibly disagree.
    if (material) material.uniforms.uIntensity.value = baseEmissive * factor
    if (light) light.intensity = SPILL_INTENSITY * factor * glow
  })

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
        The clip itself, hung in front of the glass. Null until the element
        mounts, which is a render behind the model resolving.
      */}
      {screen && video && (
        <ScreenVideo
          video={video}
          screen={screen}
          materialRef={videoMaterial}
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
            setCursor('pointer')
          }}
          onPointerOut={() => {
            setCursor(null)
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
            // grab, so without this every drag from mid-frame hit playback.
            const travelled = Math.hypot(
              event.clientX - from.x,
              event.clientY - from.y
            )
            if (travelled > TAP_SLOP) return

            // The tube is the obvious thing to press, so it is the second
            // play/pause control. The button in the corner is the first, and
            // the only one a keyboard can reach.
            onToggleVideo()
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
 * What the screen's spill drops to while the clip is paused.
 *
 * Not zero. The tube is the scene's key light, so cutting it entirely leaves
 * the machine as a silhouette in a red wash and the shot stops reading. This is
 * low enough that the amber pool on the floor no longer looks like it is coming
 * out of a screen that is plainly dark.
 */
const SPILL_FLOOR = 0.16

/** How fast the room follows the tube. Higher converges sooner. */
const SPILL_RAMP = 3.5

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
  /** The screen's maps as the model shipped them, captured before anything
      replaces them, so repainting them cannot depend on its own output. */
  screenSource: { base: THREE.Texture | null; emissive: THREE.Texture | null }
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
  let screenSource: PreparedModel['screenSource'] = {
    base: null,
    emissive: null
  }
  let glass: THREE.Mesh | null = null

  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const material = object.material
    if (Array.isArray(material)) return

    if (material.name === 'Old_Computer') {
      const screen = material as THREE.MeshStandardMaterial
      screenMaterial = screen
      // Read here rather than off `screenMaterial` later, so the originals are
      // captured before the repaint has any chance to have replaced them.
      screenSource = { base: screen.map, emissive: screen.emissiveMap }
    }
    if (material.name === 'Glass') {
      glass = object
    }
  })

  return {
    model,
    screenMaterial,
    screenSource,
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
