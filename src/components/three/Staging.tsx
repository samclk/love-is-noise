'use client'

import * as React from 'react'
import type * as THREE from 'three'
import { ContactShadows, MeshReflectorMaterial } from '@react-three/drei'
import { FLOOD, PUDDLES } from './config'
import { createPuddleMaps } from './puddles'
import { Ripples } from './Ripples'

type StagingProps = {
  /**
   * Low tier drops the planar reflection. It is the only thing in the scene
   * that renders it twice, so it is the first thing to go.
   */
  quality: 'high' | 'low'
  reducedMotion: boolean
}

/**
 * Wet ground for the machine to stand on.
 *
 * Two surfaces rather than one. The large dry plane catches the screen's spill
 * and dissolves into fog, and a smaller plane sitting a fraction above it holds
 * the puddles, masked to their shapes and carrying a real planar reflection so
 * the computer moves in the water as the camera lerps around.
 */
export function Staging({ quality, reducedMotion }: StagingProps) {
  const maps = React.useMemo(() => createPuddleMaps(), [])

  /**
   * The maps are authored to cover `PUDDLES.area` of ground, so the two planes
   * need different UV scaling to line up: the big dry floor stretches them over
   * its full size and clamps to dry beyond, while the wet layer is exactly that
   * area and uses them as-is.
   *
   * The wash is needed at both scales, so the floor gets a clone. Cloning shares
   * the underlying canvas and only costs a second set of UV settings.
   */
  const floor = React.useMemo(() => {
    const stretch = <T extends { texture: THREE.Texture; area: number } | null>(
      map: T,
      clone = false
    ) => {
      if (!map) return null
      const texture = clone ? map.texture.clone() : map.texture
      const repeat = FLOOR_SIZE / map.area
      texture.repeat.set(repeat, repeat)
      texture.offset.set(-(repeat - 1) / 2, -(repeat - 1) / 2)
      texture.needsUpdate = true
      return texture
    }

    return {
      colour: stretch(maps.colourMap),
      roughness: stretch(maps.roughnessMap),
      wash: stretch(maps.washMap, true)
    }
  }, [maps])

  React.useEffect(
    () => () => {
      maps.roughnessMap?.texture.dispose()
      maps.colourMap?.texture.dispose()
      maps.maskMap?.texture.dispose()
      maps.washMap?.texture.dispose()
      maps.glowMap?.texture.dispose()
      floor.wash?.dispose()
    },
    [maps, floor]
  )

  return (
    <>
      {/*
        Plane heights matter more than they look. The model's base sits at
        exactly y=0, so anything stacked above that draws over the bottom of the
        machine and reads as a gap under it — and a mirror placed above the
        contact point starts the reflection off the object, which makes it float.
        So the reflective layer is the contact plane, and the dry floor drops
        just beneath it to avoid z-fighting.
      */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.005, 0]}
        receiveShadow
      >
        <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
        {/*
          Roughness is left at 1 so the map multiplies straight into it: dry
          ground stays matte, damp patches drop toward gloss, and water being a
          dielectric keeps metalness at 0.

          The red street glows out of the ground rather than being thrown at it,
          masked by a wash that falls off with distance so the road burns red
          near the machine and dies away before the plane's edge. Intensity is
          held below the bloom threshold so the street does not smear.
        */}
        <meshStandardMaterial
          color="#0d0908"
          map={floor.colour}
          roughnessMap={floor.roughness}
          emissive={FLOOD}
          emissiveMap={floor.wash}
          emissiveIntensity={0.55}
          roughness={1}
          metalness={0}
          envMapIntensity={1.3}
        />
      </mesh>

      {maps.maskMap && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[PUDDLES.area, PUDDLES.area]} />
          {/*
            The water layer renders on both tiers; only the reflection is
            conditional. Dropping the whole mesh on the low tier left the dry
            floor's punched-out puddles showing through as flat black holes,
            because the wash deliberately withholds the red emissive from them.
            The cheap material keeps them looking like water — glossy, red-lit,
            picking up the lightformers — just without a mirrored render.
          */}
          {quality === 'low' ? (
            <meshStandardMaterial
              color="#1a0a0e"
              emissive={FLOOD}
              emissiveMap={maps.glowMap?.texture ?? null}
              emissiveIntensity={0.3}
              roughness={0.16}
              metalness={0.25}
              envMapIntensity={2.4}
              transparent
              alphaMap={maps.maskMap.texture}
            />
          ) : (
            /*
              A genuine mirrored render, not an environment trick, so what
              appears in the water tracks the camera as it drifts. The alpha
              mask keeps it inside the puddle outlines, and the blur stops it
              reading as a polished floor rather than standing water.
            */
            <MeshReflectorMaterial
              resolution={512}
              // Only a little blur: enough to suggest a disturbed surface, not so
              // much that the machine stops being recognisable in the water.
              mixBlur={0.45}
              mixStrength={4.5}
              // Light blur only. At [90, 30] the machine dissolved into a smear
              // and the water stopped reading as a reflection at all.
              blur={[34, 14]}
              mirror={1}
              // Left off deliberately. The depth-based fade is another variable
              // between here and a working reflection, and the blur already does
              // the softening it would buy.
              depthScale={0}
              // A mirror only shows what is above its own plane, so the red
              // emissive road underneath never appears in it. Tinting the water
              // red puts the street back into the puddles.
              color="#1a0a0e"
              // Carries the same red wash as the dry floor, so the wet layer and
              // the road underneath read as one surface rather than a sheet laid
              // over the top of it.
              emissive={FLOOD}
              emissiveMap={maps.glowMap?.texture ?? null}
              emissiveIntensity={0.3}
              roughness={0.22}
              metalness={0}
              transparent
              alphaMap={maps.maskMap.texture}
            />
          )}
        </mesh>
      )}

      {/* Rings survive the low quality tier even though the reflection does
          not — they cost one plane and no passes, and without them a
          non-reflective puddle is just a dark patch. */}
      {!reducedMotion && maps.maskMap && (
        <Ripples mask={maps.maskMap.texture} />
      )}

      {/* Anchors the machine to the floor. The directional rim gives a shadow,
          but a soft contact occlusion is what stops it looking like it hovers. */}
      <ContactShadows
        // Hugging the contact plane. Any higher and it paints across the base of
        // the machine, which is exactly what made it look lifted.
        position={[0, 0.0015, 0]}
        opacity={0.55}
        scale={12}
        blur={2.6}
        far={4}
        resolution={512}
        color="#000000"
      />
    </>
  )
}

/**
 * Far larger than anything visible. The fog has to reach full opacity before
 * this edge is reached, or the plane terminates in a hard line across the
 * horizon.
 */
const FLOOR_SIZE = 140
