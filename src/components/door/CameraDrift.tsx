'use client'

import * as React from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { CAMERA } from './config'

const TARGET = new THREE.Vector3(...CAMERA.target)
const THROUGH = new THREE.Vector3(...CAMERA.through)

type CameraDriftProps = {
  reducedMotion: boolean
  /** Pushes in towards the doorway, as if walking through it. */
  approach: boolean
}

/**
 * A slow sway and a touch of pointer parallax, so the mist and the hills slide
 * against each other, and a push-in through the doorway once the door opens.
 * Still under reduced motion, where the fade alone does the leaving.
 *
 * Also owns the field of view: portrait screens widen it, so the door stays
 * centred with land either side instead of filling the frame.
 */
export function CameraDrift({ reducedMotion, approach }: CameraDriftProps) {
  const camera = useThree((state) => state.camera)
  const aspect = useThree((state) => state.size.width / state.size.height)
  const progress = React.useRef(0)

  const home = React.useMemo(
    () => new THREE.Vector3(0, CAMERA.height, CAMERA.distance),
    []
  )

  React.useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return
    // Hold the landscape's horizontal coverage once the screen is narrower than square.
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(CAMERA.fov / 2))
    camera.fov =
      aspect >= 1
        ? CAMERA.fov
        : THREE.MathUtils.radToDeg(2 * Math.atan(halfHeight / aspect))
    camera.updateProjectionMatrix()
  }, [camera, aspect])

  React.useLayoutEffect(() => {
    camera.position.copy(home)
    camera.lookAt(TARGET)
  }, [camera, home])

  useFrame(({ clock, pointer }, delta) => {
    if (approach && !reducedMotion) {
      progress.current = Math.min(
        progress.current + delta / CAMERA.approachSeconds,
        1
      )
    }
    // Starts as a drift and gathers pace like a walk.
    const travel = Math.pow(progress.current, 1.6)
    // The sway and parallax hand over to the push-in, so the move reads clean.
    const wander = (reducedMotion ? 0 : 1) * (1 - travel)
    const t = clock.elapsedTime

    const x = home.x + (Math.sin(t * 0.07) * 0.5 + pointer.x * 0.7) * wander
    const y = THREE.MathUtils.lerp(
      home.y + (Math.sin(t * 0.05 + 1.2) * 0.15 + pointer.y * 0.25) * wander,
      THROUGH.y,
      travel
    )

    camera.position.x = THREE.MathUtils.damp(camera.position.x, x, 1.5, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, y, 1.5, delta)
    camera.position.z = THREE.MathUtils.lerp(home.z, THROUGH.z, travel)
    camera.lookAt(TARGET)
  })

  return null
}
