'use client'

import * as React from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useTouchDrag } from './useTouchDrag'

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
  // targetY sits near the machine's own centre (it spans 0 to ~2.96). Aiming
  // above the subject pushes it down the frame, which is what made it look low
  // in portrait on top of the viewport-height bug.
  narrow: { width: 6.4, targetY: 1.78, cameraY: 2.18 },
  wide: { width: 9.6, targetY: 1.62, cameraY: 2.3 }
}

/**
 * Distance is capped at both ends. Too close and the wide-angle distortion
 * bends the CRT; too far and the subject starts dissolving into its own fog.
 */
const DISTANCE = { min: 6.2, max: 15 }

const ASPECT_RANGE = { narrow: 0.75, wide: 1.35 }

/**
 * How far the pointer can drag the camera, in world units.
 *
 * The aim point stays fixed, so this is a pure orbit around the screen rather
 * than a lateral slide. Letting the target drift as well was tried and dropped:
 * it moves far more of the frame, but the shot stops being anchored on the
 * machine and starts feeling like the whole set is sliding past.
 */
const TRAVEL = { x: 0.95, y: 0.46 }

/** Higher converges faster. Framerate-independent, so it feels the same at 30 and 120fps. */
const DAMPING = 2.6

const FLOAT = { amplitude: 0.045, frequency: 0.31 }

/**
 * How quickly a touch drag drifts back to the composed shot after release.
 * Much slower than the pointer damping, so it reads as the scene settling
 * rather than being yanked back.
 */
const RECENTRE = 0.5

/**
 * A single swing into the composed shot as the scene fades up.
 *
 * This is how the scene shows it is 3D on a phone. Pointer parallax needs a
 * cursor that mobile does not have, and a drag only pays off for someone who
 * happens to try one — so depth was invisible to anyone who just opened the page
 * and looked. A one-off move needs no input, no permission and no gesture, and
 * it lands the same way every time on every device.
 *
 * The offsets are where the camera starts relative to the final framing: out to
 * one side, a little higher, a little further back, so it arcs in and settles
 * rather than sliding sideways.
 */
const ENTRANCE = {
  durationMs: 3200,
  x: 1.35,
  y: 0.4,
  z: 1.5
}

export const CAMERA_POSITION: [number, number, number] = [
  0,
  FRAMING.wide.cameraY,
  framingFor(16 / 9).distance
]

type CameraRigProps = {
  reducedMotion: boolean
  /**
   * Starts the entrance move. Driven by the same signal as the fade, so the
   * scene is already arcing in as it appears rather than starting to move once
   * it has arrived.
   */
  begin?: boolean
}

export function CameraRig({ reducedMotion, begin }: CameraRigProps) {
  const { camera, pointer, size } = useThree()
  const drag = useTouchDrag()

  /** 0 while waiting, running to 1 across the entrance. */
  const entrance = React.useRef(0)

  const framing = React.useMemo(
    () => framingFor(size.width / size.height),
    [size.width, size.height]
  )

  /** The shot's aim point. Fixed, so the camera orbits rather than slides. */
  const target = React.useMemo(
    () => new THREE.Vector3(TARGET_X, framing.targetY, 0),
    [framing.targetY]
  )

  React.useEffect(() => {
    // Placed where the entrance starts from, not at the final framing, so the
    // first frame drawn behind the fade is already the beginning of the move.
    const offset = reducedMotion ? 0 : 1
    camera.position.set(
      ENTRANCE.x * offset,
      framing.cameraY + ENTRANCE.y * offset,
      framing.distance + ENTRANCE.z * offset
    )
    camera.lookAt(target)
  }, [camera, framing, target, reducedMotion])

  useFrame((_, delta) => {
    // Reduced motion keeps the composed shot and skips the arc: the entrance is
    // automatic camera movement, which is precisely what the preference is for.
    if (reducedMotion) return

    if (begin && entrance.current < 1) {
      entrance.current = Math.min(
        1,
        entrance.current + (delta * 1000) / ENTRANCE.durationMs
      )
    }
    // Cubic ease-out: most of the travel happens early, then it settles. Held at
    // full offset until `begin`, so nothing moves while the curtain is still up.
    const settled = begin ? 1 - Math.pow(1 - entrance.current, 3) : 0
    const arriving = 1 - settled

    const touch = drag.current

    // Once a finger has driven the scene, the mouse pointer is ignored for the
    // rest of the session. On touch it holds a stale position from the last tap
    // and would fight the drag for control.
    if (touch.engaged && !touch.holding) {
      // Ease back to the composed framing, slowly enough to read as the scene
      // settling rather than snapping out of the user's hands.
      const recentre = 1 - Math.exp(-RECENTRE * delta)
      touch.x += (0 - touch.x) * recentre
      touch.y += (0 - touch.y) * recentre
    }

    const inputX = touch.engaged ? touch.x : pointer.x
    const inputY = touch.engaged ? touch.y : pointer.y

    const t = performance.now() / 1000
    const targetX = inputX * TRAVEL.x + ENTRANCE.x * arriving
    const targetY =
      framing.cameraY +
      inputY * TRAVEL.y +
      Math.sin(t * FLOAT.frequency) * FLOAT.amplitude +
      ENTRANCE.y * arriving
    const targetZ = framing.distance + ENTRANCE.z * arriving

    // Exponential damping rather than a fixed lerp factor, so the easing does
    // not change character with the frame rate.
    const alpha = 1 - Math.exp(-DAMPING * delta)
    camera.position.x += (targetX - camera.position.x) * alpha
    camera.position.y += (targetY - camera.position.y) * alpha
    camera.position.z += (targetZ - camera.position.z) * alpha

    // Fixed aim: the camera swings around the machine and the screen stays put.
    // With the aim held, the entrance's lateral offset arcs around the machine
    // rather than sliding past it.
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
