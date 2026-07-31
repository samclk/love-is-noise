'use client'

import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { FLICKER, MODEL_SIZE, MODEL_URL, SPILL } from './config'
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
}

export function OldComputer({
  reducedMotion,
  onScreenMeasured,
  onReady
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

  React.useEffect(() => {
    if (!screenMaterial || !painted) return
    screenMaterial.emissiveMap = painted.emissive
    screenMaterial.map = painted.base
    screenMaterial.needsUpdate = true

    // The repaint is the last thing to land: the logo is a plain Image, so it
    // sits outside three's loading manager and finishes after progress has
    // already reported complete. Revealing on progress alone would show the
    // baked blue DOS screen for a moment before it popped to the logo.
    onReady?.()
  }, [screenMaterial, painted, onReady])

  useFrame(({ clock }) => {
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

    if (screenMaterial) screenMaterial.emissiveIntensity = baseEmissive * factor
    // The spill has to move with the screen, or the light and its source
    // visibly disagree.
    if (light) light.intensity = SPILL_INTENSITY * factor
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
    </>
  )
}

const SPILL_INTENSITY = 7

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
