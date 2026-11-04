'use client'

import * as React from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { CAMERA } from './config'

const TARGET = new THREE.Vector3(...CAMERA.target)

/**
 * A slow sway and a touch of pointer parallax, so the mist and the hills slide
 * against each other. Still under reduced motion.
 *
 * Also owns the field of view: portrait screens widen it, so the door stays
 * centred with land either side instead of filling the frame.
 */
export function CameraDrift({ reducedMotion }: { reducedMotion: boolean }) {
  const camera = useThree((state) => state.camera)
  const aspect = useThree((state) => state.size.width / state.size.height)

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
    const t = reducedMotion ? 0 : clock.elapsedTime
    const parallax = reducedMotion ? 0 : 1
    const x = home.x + Math.sin(t * 0.07) * 0.5 + pointer.x * 0.7 * parallax
    const y =
      home.y + Math.sin(t * 0.05 + 1.2) * 0.15 + pointer.y * 0.25 * parallax

    camera.position.x = THREE.MathUtils.damp(camera.position.x, x, 1.5, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, y, 1.5, delta)
    camera.position.z = home.z
    camera.lookAt(TARGET)
  })

  return null
}
