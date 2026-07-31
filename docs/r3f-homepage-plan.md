# R3F Homepage — Agreed Plan

Branch: `feat/r3f-homepage`

A full-screen React Three Fiber canvas with the old computer model centred,
lit by its own CRT screen. Scene only — page UI is a later pass.

## Agreed decisions

| Decision | Choice |
|---|---|
| Scope | Scene in isolation. Existing homepage content deferred to a later pass. |
| Mount | Self-contained components under `src/components/three/`, mounted at `/`. |
| Camera | Locked composition, damped mouse parallax, slow idle float. No OrbitControls. |
| Lighting | CRT screen glow as hero key light. Near-black ambient, cold rim for silhouette. |
| Post-FX | Selective bloom + vignette + film grain. |
| Screen content | Scythe logo composited into the screen's UV island. |
| Phosphor | Warm amber pulled toward the site's `#feea14`. |
| Staging | Dark rough plane catching the spill, dissolving into black via fog. |
| Reflections | Inline `Lightformer` planes. No HDRI, no third-party CDN fetch. |
| Asset weight | Texture-first optimisation. Geometry untouched. |
| Performance | Adaptive quality, everyone renders. Reduced-motion gated. |

## Asset findings

`public/models/old_computer (1).glb` — Sketchfab export, 3.0 MB.

- 2 meshes, 7 nodes, 18,774 verts. No animations, no baked camera.
- Materials: `Old_Computer` (base colour, metallic-roughness, normal, occlusion,
  emissive) and `Glass` (`KHR_materials_transmission`).
- `KHR_materials_emissive_strength: 9.26`, `emissiveFactor: [1,1,1]`.
- Four 1024² PNGs total 2.48 MB of the 3.0 MB. Geometry is negligible, which is
  why Draco is not worth it here.

**Emissive atlas layout** (1024²), measured by decoding the PNG:

- Main screen island: `x 0–362, y 645–940` (363 × 296 px, aspect 1.23, i.e. 4:3).
  In UV: `u 0.000–0.354`, `v 0.630–0.918` measured from the top.
- A 12 px-wide edge sliver at `y 944–1023`. Leave it alone.
- Baked screen is a blue DOS file manager, mean lit colour `rgb(12, 25, 182)`.

The screen is a single clean rectangle in the atlas, so it can be repainted
without touching the case.

## Implementation

### 1. Dependencies

```
three@^0.185  @react-three/fiber@^9  @react-three/drei@^10  @react-three/postprocessing@^3
```

All peer-clean against React 19.2.7 and Next 16.2.10.

**Watch:** R3F 9 peers `react >=19 <19.3`. A React 19.3 bump breaks the peer
range, so pin React or check before upgrading.

### 2. Asset preparation

One-off, committed, not a build step:

- Rename to `public/models/old-computer.glb`. The current name has a space and
  parentheses in it.
- `gltf-transform` pass: PNG → WebP; resize occlusion/roughness and normal maps
  to 512 (invisible at this camera distance); leave base colour and emissive at
  1024. Target 600–900 KB.
- Delete the original once the optimised file is verified.

### 3. Screen repaint

Build the emissive map at runtime into an offscreen 1024² canvas:

1. Draw the optimised emissive texture as the base (keeps the edge sliver intact).
2. Fill the screen rect `x 0–362, y 645–940` with black.
3. Draw `lin-scythe-logo.png` into that rect, letterboxed to preserve aspect,
   tinted amber, with a subtle radial falloff so the phosphor is brighter at
   centre.
4. Use as `THREE.CanvasTexture` with `flipY = false` and sRGB colour space —
   `GLTFLoader` sets `flipY = false`, so canvas pixel coords map directly to the
   measured rect with no vertical flip.

Keep `material.emissive` white and carry the amber in the painted pixels, so the
phosphor can hold a gradient rather than a flat tint.

### 4. Lighting rig

**Critical:** emissive materials in three.js do not illuminate anything — there
is no global illumination. The screen glow must be faked with a real light
co-located with the screen plane, or the "spill" simply will not exist.

- Near-black ambient (~0.03).
- Amber `RectAreaLight` sitting on the screen plane, facing out. This is the key
  and the source of the spill onto the bezel and floor.
- Cold blue-white rim from behind and slightly above, low intensity, for
  silhouette separation. This is the shadow caster.
- Very dim fill so the case does not crush to pure black.
- `Environment` in inline mode with 2–3 `Lightformer` planes at low resolution
  (256) for the bezel highlights and the transmissive glass.

### 5. Staging

- Large plane, dark `meshStandardMaterial`, high roughness, receives shadows.
- Exponential black fog so the plane's edge is never visible.
- `ContactShadows` to anchor the machine, plus soft shadows from the rim light
  at a modest map size.

### 6. Camera

- `PerspectiveCamera`, ~35° fov. A longer lens is more filmic and distorts the
  CRT less than the default 50°.
- Parallax: damped lerp of camera position toward the pointer in `useFrame`,
  a few degrees of travel only, always looking at the machine.
- Idle float: low-frequency sine on Y so it never sits perfectly still.

### 7. Post-processing

`EffectComposer` with Bloom, Vignette and Noise. Set the bloom luminance
threshold above the beige case's brightness so only the screen blooms — the
whole point of "selective" here is that the plastic must not go milky. Set
`gl={{ antialias: false }}` on the Canvas and let the composer handle AA, since
the default MSAA is wasted once there is a post pass.

### 8. Accessibility and performance

- **Flicker:** low-frequency and low-amplitude only. Rapid luminance flicker is
  a photosensitivity risk. Gate it, the idle float and the parallax behind
  `prefers-reduced-motion`.
- `dpr={[1, 1.5]}` so retina panels do not render 4× the pixels.
- Drop bloom resolution on low-power devices.
- Pause the frame loop when the canvas is off-screen or the tab is hidden.
- `useGLTF.preload` for the model.

### 9. Structure

```
src/components/three/
  Scene.tsx              'use client' — Canvas, composition, Suspense boundary
  OldComputer.tsx        model + painted emissive texture
  Lighting.tsx           rig + lightformers
  Staging.tsx            floor, fog, contact shadows
  Effects.tsx            EffectComposer stack
  useScreenTexture.ts    canvas compositing of the scythe logo
  useCameraRig.ts        parallax + idle float, reduced-motion aware
src/app/page.tsx         mounts Scene
```

**SSR risk:** `Canvas` touches browser APIs, so it cannot render on the server.
Next 16 disallows `next/dynamic` with `ssr: false` inside a Server Component, so
the pattern is a `'use client'` wrapper that does the dynamic import internally.
Resolve this first — it is the most likely thing to bite on initial setup.

### 10. Conventions

This repo uses **Prettier**, not Biome: no semicolons, single quotes, 2-space
indent, no trailing commas. Match it.

## Build order

1. Deps installed, asset renamed and optimised, blank full-screen canvas rendering.
2. Model loading and centred, default lighting, prove the SSR pattern works.
3. Lighting rig and staging.
4. Screen repaint with the scythe logo.
5. Post-processing.
6. Camera rig and flicker.
7. Performance and reduced-motion passes.

## As built — where reality differed

Five things the plan did not anticipate:

**The base colour map had to be repainted too.** Emission is *added* to base
colour, so swapping only the emissive map left the original blue DOS rectangle
showing through beneath the amber. Both maps are now repainted.

**The screen and bezel overlap in the UV atlas.** The screen quad samples a
wider region than the baked artwork covers, dragging in a patch of case grime
that appeared in the screen's top-left. There is no rect that wipes the screen
without also blackening the monitor's surround — verified by widening it until
the bezel broke. The committed bounds sit just short of that, leaving a faint
warm cast at the top of the screen that passes for a reflection.

The quad's true UV bounds could not be derived from the geometry either: the
glass and case meshes sit under different node transforms and the atlas region
is shared across parts, so both the UV-to-position and normal-filtering
approaches returned the whole atlas. Logo placement was calibrated from renders
instead, which is why `LOGO_RECT` is separate from `SCREEN_RECT`.

**Camera framing had to become responsive.** A fixed camera cropped the machine
badly in portrait. Framing now interpolates on aspect ratio: wide viewports
frame the whole desk, narrow ones pull back and ride up to favour the monitor.

**Fog density dropped from 0.055 to 0.026.** Fog is distance-based, and the
responsive framing pulls the camera to ~13 units on narrow viewports, where the
original density began dissolving the subject rather than the horizon.

**Model optimisation became a committed script.** The `gltf-transform` CLI could
not target textures by slot on this file (its images are unnamed, and its arg
parser splits brace globs on commas), so `scripts/optimise-model.mjs` does it
against the API instead. Result: 3.03 MB → 712 KB, textures 2.36 MB → 0.15 MB.
The untouched Sketchfab export is kept locally as `old-computer.source.glb` and
gitignored, so the script stays re-runnable without committing 3 MB.

## Verified

Driven in real Chrome via Playwright at 1440×900, 1440×900 @ dpr 2, portrait
390×844 @ dpr 3, and with `prefers-reduced-motion: reduce`. No console errors,
no failed requests, and no page errors in any configuration. The DPR clamp
holds: device pixel ratios of 2 and 3 both render at an effective 1.5.
`yarn build` passes and `/` still prerenders as static.

## Known gaps

- Under `prefers-reduced-motion` nothing animates, but the frame loop still runs
  at `always`. Switching to `demand` would save battery; it needs careful
  `invalidate()` calls around the async texture swap to avoid a blank canvas,
  so it was left alone rather than risked.
- The `Glass` material's transmission is left as authored. It is the most
  expensive thing in the scene and is a candidate for disabling in the low
  quality tier if profiling on real mobile hardware justifies it.
- Framerate was not profiled on real mobile hardware — the checks above ran
  against SwiftShader, which says nothing about actual GPU performance.

## Open for later

- Where the store links, tour, discord, videos and socials live relative to the
  scene.
- Whether the CRT eventually becomes real navigation, which the screen-as-canvas
  approach leaves the door open for.
