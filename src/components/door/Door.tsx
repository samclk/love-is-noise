'use client'

import * as React from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { DOOR, MODEL_URL } from './config'

/** The door's footprint and height once placed, for the rain to land on. */
export type DoorBounds = THREE.Box3

type DoorProps = {
  /** Swings the door away from the camera. */
  open: boolean
  onMeasured: (bounds: DoorBounds) => void
  /** A click or tap on the door while it is shut. */
  onPress: () => void
  reducedMotion: boolean
}

/**
 * The door, standing on level ground at the origin and facing the camera, and
 * opening away from it on its hinges.
 *
 * The export is one rigid object, so it is taken apart on load: the frame stays
 * put and the slab, with its handles, latch and screws, hangs from a pivot on
 * the edge opposite the handle.
 */
export function Door({ open, onMeasured, onPress, reducedMotion }: DoorProps) {
  const { scene } = useGLTF(MODEL_URL)
  const door = React.useMemo(() => assemble(scene), [scene])
  const progress = React.useRef(0)

  React.useEffect(() => {
    onMeasured(door.bounds)
  }, [door, onMeasured])

  React.useEffect(() => () => door.dispose(), [door])

  useFrame((_, delta) => {
    const target = open ? 1 : 0
    if (reducedMotion) progress.current = target
    const step = delta / DOOR.openSeconds
    progress.current =
      target > progress.current
        ? Math.min(progress.current + step, target)
        : Math.max(progress.current - step, target)
    door.hinge.rotation.y = door.swing * easeInOut(progress.current)
  })

  const size = door.bounds.getSize(new THREE.Vector3())
  const centre = door.bounds.getCenter(new THREE.Vector3())

  return (
    <group>
      <primitive object={door.root} />
      {/* A padded, invisible target, since the door is small on a phone. */}
      <mesh
        position={centre}
        onClick={(event) => {
          event.stopPropagation()
          if (!open) onPress()
        }}
        onPointerOver={() => {
          if (!open) document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = ''
        }}
      >
        <boxGeometry args={[size.x + 0.5, size.y + 0.3, size.z + 0.5]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

/**
 * Rebuilds the export as a frame and a hinged slab, all in world space so the
 * hinge can sit exactly on the slab's edge.
 *
 * The export is Z-up under a root rotation, which leaves its width along world
 * Z; a quarter turn about Y faces it to the camera first.
 */
function assemble(gltf: THREE.Object3D) {
  const source = gltf.clone(true)
  source.rotation.y = Math.PI / 2
  source.updateMatrixWorld(true)

  const frame: THREE.Mesh[] = []
  const slab: THREE.Mesh[] = []
  const panel = new THREE.Box3()
  const materials: THREE.Material[] = []
  const handles = new THREE.Box3()

  source.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    const original = child.material as THREE.MeshStandardMaterial
    const geometry = child.geometry.clone().applyMatrix4(child.matrixWorld)

    if (original.name === 'Door_Material') {
      const material = wet(original)
      materials.push(material)
      const parts = splitFrame(geometry)
      geometry.dispose()
      frame.push(toMesh(parts.frame, material))
      const slabPanel = toMesh(parts.slab, material)
      panel.expandByObject(slabPanel)
      slab.push(slabPanel)
      return
    }

    const mesh = toMesh(geometry, original)
    if (original.name === 'Handle_Frame') handles.expandByObject(mesh)
    slab.push(mesh)
  })

  const slabBounds = new THREE.Box3()
  for (const mesh of slab) slabBounds.expandByObject(mesh)

  // The hinge runs up the edge opposite the handle, on the face away from the
  // camera, so the slab swings away and opens onto the land behind.
  const handleOnLeft =
    handles.getCenter(new THREE.Vector3()).x <
    slabBounds.getCenter(new THREE.Vector3()).x
  const pivot = new THREE.Vector3(
    handleOnLeft ? slabBounds.max.x : slabBounds.min.x,
    0,
    slabBounds.min.z
  )

  const hinge = new THREE.Group()
  hinge.position.copy(pivot)
  for (const mesh of slab) {
    mesh.geometry.translate(-pivot.x, -pivot.y, -pivot.z)
    hinge.add(mesh)
  }

  const root = new THREE.Group()
  const blackness = buildVoid(panel)
  root.add(...frame, hinge, blackness)

  return {
    root,
    hinge,
    // Negative turns a right-hand hinge's slab away from the camera.
    swing: THREE.MathUtils.degToRad(DOOR.openDegrees) * (handleOnLeft ? -1 : 1),
    bounds: new THREE.Box3().setFromObject(root),
    dispose() {
      for (const mesh of [...frame, ...slab]) mesh.geometry.dispose()
      for (const material of materials) material.dispose()
      blackness.geometry.dispose()
    }
  }
}

/**
 * Pitch black filling the doorway, just behind the shut slab, so the door opens
 * onto nothing rather than the hillside behind it. Unlit and unfogged, and the
 * grade leaves true black alone, so it stays black on screen.
 */
function buildVoid(panel: THREE.Box3) {
  const size = panel.getSize(new THREE.Vector3())
  const centre = panel.getCenter(new THREE.Vector3())
  const blackness = new THREE.Mesh(
    new THREE.PlaneGeometry(size.x, size.y),
    VOID_MATERIAL
  )
  blackness.position.set(centre.x, centre.y, panel.min.z - 0.002)
  return blackness
}

const VOID_MATERIAL = new THREE.MeshBasicMaterial({
  color: 'black',
  fog: false
})

/**
 * Separates the frame from the slab in the export's shared mesh.
 *
 * They are separate closed shells, so the triangles are grouped into connected
 * pieces (vertices welded by position, since UV seams split them) and each piece
 * is sorted by height: only the frame rises past the top of the slab.
 */
function splitFrame(geometry: THREE.BufferGeometry) {
  const position = geometry.getAttribute('position')
  const index = geometry.getIndex()!
  const triangles = index.count / 3

  const welded = new Int32Array(position.count)
  const seen = new Map<string, number>()
  for (let v = 0; v < position.count; v++) {
    const key = `${position.getX(v).toFixed(4)},${position.getY(v).toFixed(4)},${position.getZ(v).toFixed(4)}`
    if (!seen.has(key)) seen.set(key, v)
    welded[v] = seen.get(key)!
  }

  const parent = Int32Array.from({ length: position.count }, (_, v) => v)
  const find = (v: number) => {
    while (parent[v] !== v) v = parent[v] = parent[parent[v]!]!
    return v
  }
  const vertex = (t: number, corner: number) =>
    welded[index.getX(t * 3 + corner)]!
  for (let t = 0; t < triangles; t++) {
    const a = find(vertex(t, 0))
    parent[find(vertex(t, 1))] = a
    parent[find(vertex(t, 2))] = a
  }

  const top = new Map<number, number>()
  for (let v = 0; v < position.count; v++) {
    const piece = find(welded[v]!)
    top.set(piece, Math.max(top.get(piece) ?? -Infinity, position.getY(v)))
  }
  const slabTop = Math.min(...top.values())

  const frame: number[] = []
  const slab: number[] = []
  for (let t = 0; t < triangles; t++) {
    const piece = find(vertex(t, 0))
    const into = top.get(piece)! > slabTop + 0.01 ? frame : slab
    into.push(index.getX(t * 3), index.getX(t * 3 + 1), index.getX(t * 3 + 2))
  }

  const withIndex = (indices: number[]) => {
    const part = geometry.clone()
    part.setIndex(indices)
    return part
  }
  return { frame: withIndex(frame), slab: withIndex(slab) }
}

function toMesh(geometry: THREE.BufferGeometry, material: THREE.Material) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
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

/** Slow to start, as a heavy door is, and settling gently at the end. */
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

useGLTF.preload(MODEL_URL)
