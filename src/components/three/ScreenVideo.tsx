'use client'

import * as React from 'react'
import * as THREE from 'three'
import { PHOSPHOR, SCREEN_VIDEO } from './config'

type ScreenVideoProps = {
  /** The element to sample. Lives in the DOM — see useScreenClip. */
  video: HTMLVideoElement
  /** The glass panel's measured bounds, already in world units. */
  screen: { centre: THREE.Vector3; width: number; height: number }
  /**
   * Handed the material so OldComputer can drive its brightness from the same
   * flicker the spill light rides on. The two have to agree, or the light and
   * its source visibly disagree.
   */
  materialRef: React.RefObject<THREE.ShaderMaterial | null>
}

/**
 * The clip, as light coming out of the tube.
 *
 * A quad hung just in front of the glass rather than a repaint of the model's
 * texture atlas, and additive rather than opaque. See SCREEN_VIDEO for why both.
 */
export function ScreenVideo({ video, screen, materialRef }: ScreenVideoProps) {
  const texture = React.useMemo(() => new THREE.VideoTexture(video), [video])

  React.useEffect(() => () => texture.dispose(), [texture])

  /**
   * Whether the tube is lit at all.
   *
   * Tracked here from the element rather than threaded down from the button's
   * state: this quad is the only thing that needs it, and the chain from
   * HomeScene to here is three components long.
   */
  const [running, setRunning] = React.useState(false)

  React.useEffect(() => {
    const sync = () => setRunning(!video.paused)
    video.addEventListener('play', sync)
    video.addEventListener('pause', sync)
    sync()

    return () => {
      video.removeEventListener('play', sync)
      video.removeEventListener('pause', sync)
    }
  }, [video])

  const width = screen.width * SCREEN_VIDEO.inset
  const height = screen.height * SCREEN_VIDEO.inset

  const uniforms = React.useMemo(
    () =>
      THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uMap: { value: null },
          uScale: { value: cover(width / height, SCREEN_VIDEO.aspect) },
          uPhosphor: { value: phosphorChroma() },
          uAspect: { value: width / height },
          uIntensity: { value: 0 },
          uKeyed: { value: SCREEN_VIDEO.tone === 'mask' ? 1 : 0 },
          uKeyLow: { value: SCREEN_VIDEO.keyLow },
          uKeyHigh: { value: SCREEN_VIDEO.keyHigh },
          uGamma: { value: SCREEN_VIDEO.gamma },
          uGain: { value: SCREEN_VIDEO.gain },
          uChroma: { value: SCREEN_VIDEO.chroma },
          uScanlines: { value: SCREEN_VIDEO.scanlines },
          uScanDepth: { value: SCREEN_VIDEO.scanlineDepth },
          uFalloff: { value: SCREEN_VIDEO.falloff }
        }
      ]),
    [width, height]
  )

  const config = React.useMemo(
    () => ({
      uniforms,
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      fog: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      // Adds to whatever is already there, so it must not occlude the glass it
      // is adding to.
      depthWrite: false,
      toneMapped: false
    }),
    [uniforms]
  )

  // Written into the object the material is handed, not through the material:
  // UniformsUtils.merge clones what it is given, so this has to target whatever
  // the memo last produced or the tube goes black with nothing to show for it.
  React.useEffect(() => {
    uniforms.uMap.value = texture
  }, [uniforms, texture])

  return (
    <mesh
      // A paused tube is an unlit tube. Hiding the quad rather than leaving the
      // last frame on it is also what keeps the texture off the GPU's back: a
      // paused video presents no frames, so VideoTexture would be showing
      // whatever it last uploaded regardless.
      visible={running}
      position={[
        screen.centre.x,
        screen.centre.y,
        screen.centre.z + SCREEN_VIDEO.offset
      ]}
      // The glass is the page's only click target and it is measured separately
      // in OldComputer. This quad sitting in front of it must not steal the hit.
      raycast={() => null}
    >
      <planeGeometry args={[width, height]} />
      {/*
        The config is memoised, not written inline. R3F compares `args`
        element-wise by reference and rebuilds the instance when one changes, so
        an object literal here would dispose the material and recompile its
        program on every render — which includes every press of the play button.
      */}
      <shaderMaterial ref={materialRef} args={[config]} />
    </mesh>
  )
}

/**
 * UV scale that crops the clip to fill the tube instead of letterboxing it.
 *
 * The clip is 4:3 and the tube is a little squarer, so cropping costs about
 * three percent off each side — nothing, on type this centred — where bars
 * would leave two dead stripes across a screen that is meant to be full.
 */
function cover(planeAspect: number, videoAspect: number) {
  return new THREE.Vector2(
    Math.min(1, planeAspect / videoAspect),
    Math.min(1, videoAspect / planeAspect)
  )
}

/**
 * The phosphor scaled to a luma of exactly 1.
 *
 * Mixing two unit-luma colours gives another unit-luma colour, so how much of
 * the clip's own hue is retained cannot change how hard a pixel glows, and
 * therefore cannot change what the composer blooms.
 *
 * NoColorSpace on the way in, because every step of the shader's tint runs on
 * sRGB values the way the old canvas repaint did, and linearises once at the
 * end.
 */
function phosphorChroma() {
  const colour = new THREE.Color().setStyle(PHOSPHOR, THREE.NoColorSpace)
  const luma = 0.2126 * colour.r + 0.7152 * colour.g + 0.0722 * colour.b
  return colour.multiplyScalar(1 / luma)
}

const VERTEX = /* glsl */ `
  varying vec2 vUv;

  #include <common>
  #include <fog_pars_vertex>

  void main() {
    vUv = uv;

    #include <begin_vertex>
    #include <project_vertex>
    #include <fog_vertex>
  }
`

const FRAGMENT = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uScale;
  uniform vec3 uPhosphor;
  uniform float uAspect;
  uniform float uIntensity;
  uniform float uKeyed;
  uniform float uKeyLow;
  uniform float uKeyHigh;
  uniform float uGamma;
  uniform float uGain;
  uniform float uChroma;
  uniform float uScanlines;
  uniform float uScanDepth;
  uniform float uFalloff;

  varying vec2 vUv;

  #include <common>
  #include <fog_pars_fragment>

  void main() {
    vec3 src = texture2D(uMap, (vUv - 0.5) * uScale + 0.5).rgb;

    // The clip's brightness decides how hard a pixel glows; its hue is then
    // blended toward the phosphor, so the tube reads as lit from behind rather
    // than as a video pasted onto the glass.
    float luma = dot(src, vec3(0.2126, 0.7152, 0.0722));
    // Two ways to get from brightness to glow: a ramp that keeps every shade,
    // and a key that keeps none of them. See SCREEN_VIDEO.tone.
    float ramp = pow(luma, uGamma);
    float keyed = smoothstep(uKeyLow, uKeyHigh, luma);
    float level = uGain * mix(ramp, keyed, uKeyed);
    vec3 own = luma > 0.004 ? src / luma : vec3(0.0);
    vec3 colour = mix(uPhosphor, own, uChroma) * level;

    // One dark row in every three. Subtle at this size, but it kills the
    // flatness that gives a video-on-a-model away.
    colour *= 1.0 - uScanDepth * step(fract(vUv.y * uScanlines), 0.334);

    // Phosphor tubes are brighter at the centre and fall away to the bezel.
    float radius = length((vUv - 0.5) * vec2(uAspect, 1.0)) * 2.0;
    colour *= 1.0 - uFalloff * smoothstep(0.25, 1.1, radius);

    // Linearised only here. Everything above runs in sRGB, which is the space
    // the phosphor and its curve were authored in, and the composer is handed
    // untone-mapped HDR so the emissive strength can carry it over the bloom
    // threshold.
    gl_FragColor = vec4(pow(colour, vec3(2.2)) * uIntensity, 1.0);

    #include <fog_fragment>
  }
`
