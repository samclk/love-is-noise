'use client'

import * as React from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { MODEL_URL } from './config'

/** The door's footprint and height once placed, for the rain to land on. */
export type DoorBounds = THREE.Box3

/**
 * The door, standing on level ground at the origin and facing the camera.
 *
 * The Sketchfab export is Z-up under a root rotation, which leaves its width
 * running along world Z. A quarter turn about Y faces it to the camera.
 */
export function Door({
  onMeasured
}: {
  onMeasured: (bounds: DoorBounds) => void
}) {
  const { scene } = useGLTF(MODEL_URL)

  const door = React.useMemo(() => {
    const clone = scene.clone(true)
    clone.rotation.y = Math.PI / 2
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material?.name === 'Door_Material') {
          child.material = wet(child.material)
        }
      }
    })
    clone.updateMatrixWorld(true)
    return clone
  }, [scene])

  React.useEffect(() => {
    onMeasured(new THREE.Box3().setFromObject(door))
  }, [door, onMeasured])

  return <primitive object={door} />
}

/**
 * The export's door and frame are one pale, matte material, which vanishes
 * against the pale mist. Darker and glossy reads as rain-soaked paint, and the
 * sheen along its edges is what shows the frame from this far away.
 */
function wet(material: THREE.MeshStandardMaterial) {
  const soaked = material.clone()
  soaked.color.set('#66777b')
  soaked.metalness = 0.05
  soaked.roughness = 0.32
  return soaked
}

useGLTF.preload(MODEL_URL)
