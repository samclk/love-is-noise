'use client'

import * as React from 'react'
import { useThree } from '@react-three/fiber'

export type Drag = {
  /** Normalised -1..1, same range and meaning as R3F's pointer. */
  x: number
  y: number
  /** True once a touch has driven the scene, so the rig can ignore the pointer. */
  engaged: boolean
  holding: boolean
}

/** How far a full-screen swipe moves the view. Above 1 so a short drag registers. */
const SENSITIVITY = 2.1

/**
 * Turns touch dragging into a pointer-like offset.
 *
 * R3F's own pointer already updates on touch, but it maps the finger's absolute
 * position straight onto the camera: the view snaps to wherever you first touch
 * and is then abandoned there when you let go. That reads as a glitch rather
 * than a control.
 *
 * This accumulates the drag *delta* instead, so the scene moves with the finger
 * from wherever it already was, and eases back to the composed framing once
 * released — the locked shot stays home.
 */
export function useTouchDrag() {
  const { gl, size } = useThree()
  const drag = React.useRef<Drag>({
    x: 0,
    y: 0,
    engaged: false,
    holding: false
  })

  React.useEffect(() => {
    const element = gl.domElement
    const last = { x: 0, y: 0 }

    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return
      drag.current.engaged = true
      drag.current.holding = true
      last.x = event.clientX
      last.y = event.clientY
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || !drag.current.holding) return

      const dx = (event.clientX - last.x) / size.width
      const dy = (event.clientY - last.y) / size.height
      last.x = event.clientX
      last.y = event.clientY

      drag.current.x = clamp(drag.current.x + dx * SENSITIVITY, -1, 1)
      // Inverted so dragging down looks down, matching how the mouse behaves.
      drag.current.y = clamp(drag.current.y - dy * SENSITIVITY, -1, 1)
    }

    const onRelease = () => {
      drag.current.holding = false
    }

    element.addEventListener('pointerdown', onDown, { passive: true })
    element.addEventListener('pointermove', onMove, { passive: true })
    element.addEventListener('pointerup', onRelease, { passive: true })
    // The browser fires this when it claims the gesture for scrolling, and
    // without it the drag would stay stuck holding.
    element.addEventListener('pointercancel', onRelease, { passive: true })
    element.addEventListener('pointerleave', onRelease, { passive: true })

    return () => {
      element.removeEventListener('pointerdown', onDown)
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerup', onRelease)
      element.removeEventListener('pointercancel', onRelease)
      element.removeEventListener('pointerleave', onRelease)
    }
  }, [gl, size.width, size.height])

  return drag
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
