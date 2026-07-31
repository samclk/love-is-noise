'use client'

import * as React from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'

export const CAMERA_FOV = 35

/**
 * Aimed left of the model's true centre. The bounding box is dragged rightward
 * by the mouse and its cable, so centring on it mathematically leaves the
 * monitor — the actual focal point — sitting left of frame.
 */
const TARGET_X = -0.5

/**
 * The machine is a wide, landscape object, so a portrait viewport cannot hold
 * all of it at a readable size. Rather than crop the monitor off the edge, the
 * framing shifts: wide viewports frame the whole desk, narrow ones pull back and
 * ride up to favour the monitor, letting the keyboard fall out of frame.
 */
const FRAMING = {
  narrow: { width: 6.4, targetY: 2.0, cameraY: 2.4 },
  wide: { width: 9.6, targetY: 1.62, cameraY: 2.3 }
}

/**
 * Distance is capped at both ends. Too close and the wide-angle distortion
 * bends the CRT; too far and the subject starts dissolving into its own fog.
 */
const DISTANCE = { min: 6.2, max: 15 }

const ASPECT_RANGE = { narrow: 0.75, wide: 1.35 }

/** How far the pointer can drag the camera, in world units. */
const TRAVEL = { x: 0.55, y: 0.28 }

/** Higher converges faster. Framerate-independent, so it feels the same at 30 and 120fps. */
const DAMPING = 2.6

const FLOAT = { amplitude: 0.045, frequency: 0.31 }

export const CAMERA_POSITION: [number, number, number] = [
  0,
  FRAMING.wide.cameraY,
  framingFor(16 / 9).distance
]

type CameraRigProps = {
  reducedMotion: boolean
}

export function CameraRig({ reducedMotion }: CameraRigProps) {
  const { camera, pointer, size } = useThree()

  const framing = React.useMemo(
    () => framingFor(size.width / size.height),
    [size.width, size.height]
  )

  const target = React.useMemo(
    () => new THREE.Vector3(TARGET_X, framing.targetY, 0),
    [framing.targetY]
  )

  React.useEffect(() => {
    camera.position.set(0, framing.cameraY, framing.distance)
    camera.lookAt(target)
  }, [camera, framing, target])

  useFrame((_, delta) => {
    if (reducedMotion) return

    const t = performance.now() / 1000
    const targetX = pointer.x * TRAVEL.x
    const targetY =
      framing.cameraY +
      pointer.y * TRAVEL.y +
      Math.sin(t * FLOAT.frequency) * FLOAT.amplitude

    // Exponential damping rather than a fixed lerp factor, so the easing does
    // not change character with the frame rate.
    const alpha = 1 - Math.exp(-DAMPING * delta)
    camera.position.x += (targetX - camera.position.x) * alpha
    camera.position.y += (targetY - camera.position.y) * alpha
    camera.lookAt(target)
  })

  return null
}

function framingFor(aspect: number) {
  const t = clamp(
    (aspect - ASPECT_RANGE.narrow) / (ASPECT_RANGE.wide - ASPECT_RANGE.narrow),
    0,
    1
  )

  const width = lerp(FRAMING.narrow.width, FRAMING.wide.width, t)
  const targetY = lerp(FRAMING.narrow.targetY, FRAMING.wide.targetY, t)
  const cameraY = lerp(FRAMING.narrow.cameraY, FRAMING.wide.cameraY, t)

  // Solve for the distance at which `width` world units span the viewport,
  // working from the horizontal field of view implied by the vertical one.
  const halfHeight = Math.tan((CAMERA_FOV * Math.PI) / 180 / 2)
  const distance = clamp(
    width / 2 / (halfHeight * aspect),
    DISTANCE.min,
    DISTANCE.max
  )

  return { distance, targetY, cameraY }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
