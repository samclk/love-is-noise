'use client'

import {
  Bloom,
  EffectComposer,
  Noise,
  ToneMapping,
  Vignette
} from '@react-three/postprocessing'
import { BlendFunction, KernelSize, ToneMappingMode } from 'postprocessing'

type EffectsProps = {
  /** Low tier trades bloom quality and grain for frame time on weaker GPUs. */
  quality: 'high' | 'low'
}

export function Effects({ quality }: EffectsProps) {
  const low = quality === 'low'

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {/*
        The renderer is left in NoToneMapping so the composer receives real HDR
        values. With the screen authored at an emissive strength of 9.26, a
        threshold just above 1 means the glass blooms hard while the beige case
        — which never exceeds 1 under this rig — stays crisp instead of going
        milky. That selectivity is the whole point.
      */}
      <Bloom
        intensity={low ? 1.2 : 1.75}
        luminanceThreshold={1.05}
        luminanceSmoothing={0.28}
        // LARGE adds passes to a glow that is already soft and wide.
        kernelSize={low ? KernelSize.SMALL : KernelSize.MEDIUM}
        mipmapBlur
      />

      {/* Tone map after bloom, so the glow is built from the real dynamic range
          and only then compressed for the display. */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

      <Vignette offset={0.28} darkness={0.82} eskil={false} />

      {/* Dark gradients band badly on cheap panels; a little grain dithers it
          away and doubles as film texture. */}
      <Noise
        premultiply
        blendFunction={BlendFunction.SOFT_LIGHT}
        opacity={low ? 0.18 : 0.32}
      />
    </EffectComposer>
  )
}
