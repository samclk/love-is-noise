'use client'

import * as React from 'react'
import { Uniform, Vector3 } from 'three'
import {
  Bloom,
  EffectComposer,
  Noise,
  ToneMapping,
  Vignette
} from '@react-three/postprocessing'
import {
  BlendFunction,
  Effect,
  KernelSize,
  ToneMappingMode
} from 'postprocessing'

/**
 * The "black sheep." grade: soft highlights that halate, lifted teal-blue
 * blacks, colour pulled down and bent towards blue-green, then grain.
 */
export function Effects() {
  const grade = React.useMemo(() => new GradeEffect(), [])
  React.useEffect(() => () => grade.dispose(), [grade])

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {/* A low threshold on purpose: the whole bright sky glows a little, which
          is most of what makes it read as misty rather than merely pale. */}
      <Bloom
        intensity={0.55}
        luminanceThreshold={0.62}
        luminanceSmoothing={0.35}
        kernelSize={KernelSize.LARGE}
        mipmapBlur
      />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <primitive object={grade} />
      <Vignette offset={0.25} darkness={0.6} eskil={false} />
      <Noise
        premultiply
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={0.35}
      />
    </EffectComposer>
  )
}

/** Shadows sink to this rather than to black. */
const LIFT = new Vector3(0.07, 0.11, 0.13)
/** Multipliers for the darks and the lights, so the split tone stays a tint. */
const SHADOW_TINT = new Vector3(0.78, 0.97, 1.12)
const HIGHLIGHT_TINT = new Vector3(0.93, 1.03, 1.04)

class GradeEffect extends Effect {
  constructor() {
    super('GradeEffect', FRAGMENT, {
      uniforms: new Map<string, Uniform>([
        ['uLift', new Uniform(LIFT)],
        ['uShadowTint', new Uniform(SHADOW_TINT)],
        ['uHighlightTint', new Uniform(HIGHLIGHT_TINT)],
        ['uSaturation', new Uniform(0.74)],
        ['uContrast', new Uniform(0.9)]
      ])
    })
  }
}

const FRAGMENT = /* glsl */ `
  uniform vec3 uLift;
  uniform vec3 uShadowTint;
  uniform vec3 uHighlightTint;
  uniform float uSaturation;
  uniform float uContrast;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Graded in display space, where "shadows" and "highlights" mean what the eye
    // thinks they mean. The composer encodes to sRGB after this pass.
    vec3 colour = pow(max(inputColor.rgb, 0.0), vec3(1.0 / 2.2));
    // Nothing in the landscape is this dark; only the doorway's void is, and
    // it must stay pitch black rather than lifting to teal with the rest.
    float lit = smoothstep(0.0, 0.04, max(colour.r, max(colour.g, colour.b)));

    float luma = dot(colour, vec3(0.2126, 0.7152, 0.0722));
    colour = mix(vec3(luma), colour, uSaturation);
    colour *= mix(uShadowTint, uHighlightTint, smoothstep(0.05, 0.85, luma));
    colour = (colour - 0.5) * uContrast + 0.5;
    colour = uLift + colour * (1.0 - uLift);
    colour *= lit;

    outputColor = vec4(pow(clamp(colour, 0.0, 1.0), vec3(2.2)), inputColor.a);
  }
`
