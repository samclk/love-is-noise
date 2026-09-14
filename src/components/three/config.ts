export const MODEL_URL = '/models/old-computer.glb'
/**
 * The clip burned into the tube.
 *
 * Re-encoded from the 1438x1080 master to 640x480 with the audio track
 * stripped: the tube renders at roughly 360px across, so the master was
 * carrying nine times the pixels anyone can see, and the page is never allowed
 * to play the audio. 21MB down to 1.6MB.
 *
 * CRF 30 rather than the 26 a full-size clip would want. The shader throws away
 * the colour and reduces the picture to amber luma with scanlines over it, so
 * compression artefacts that would show on a normal video are gone by the time
 * anything reaches the glass.
 */
export const CLIP_URL = '/video/screen-clip.mp4'

/**
 * Where the band's merch actually lives.
 *
 * Four regions with four separate storefronts, which is why Merch opens a
 * chooser rather than a link — there is no single correct destination, and
 * guessing someone's region is worse than asking.
 */
export const STORES = [
  { label: 'uk store', href: 'https://shop.loveisnoise.world' },
  { label: 'us store', href: 'https://loveisnoise-world.myshopify.com/' },
  {
    label: 'eu store',
    href: 'https://www.impericon.com/collections/love-is-noise/'
  },
  {
    label: 'aus/sea store',
    href: 'https://www.cvltindustries.com/collections/love-is-noise'
  }
]

/** A destination the screen offers, as a control outside the canvas. */
export type ScreenAction =
  | { kind: 'link'; href: string; label: string }
  | { kind: 'stores'; label: string }

/**
 * The page's calls to action.
 *
 * These used to be slides cycling on the tube, clickable through the glass. The
 * tube now plays the clip and nothing else, so they survive only as the
 * focus-reachable controls in ScreenLinks — which is where a keyboard or a
 * screen reader always reached them anyway, since a hit target inside a canvas
 * does not exist for either.
 */
export const SCREEN_ACTIONS: ScreenAction[] = [
  { kind: 'stores', label: 'shop merch' },
  {
    kind: 'link',
    href: 'https://discord.gg/skHFhyZKc2',
    label: 'join the discord'
  },
  {
    kind: 'link',
    href: 'https://loveisnoise.bfan.link/the-space-between-happiness-and-heartache',
    label: 'pre-save the ep'
  },
  {
    kind: 'link',
    href: 'https://www.songkick.com/artists/10190645-love-is-noise',
    label: 'live dates and tickets'
  }
]

/** Width and height of the model's emissive texture atlas, in pixels. */
export const ATLAS_SIZE = 1024

/**
 * The area of the atlas wiped before the screen is repainted.
 *
 * The screen quad samples a wider region than the baked DOS artwork covers —
 * notably a patch of case grime just above it, which otherwise shows through in
 * the screen's top-left corner.
 *
 * Kept tight to the screen itself. The screen and the bezel overlap in this
 * atlas, so every pixel this rect reaches beyond the tube risks blacking out
 * part of the monitor's surround — an earlier version stretched up to y=515 to
 * swallow the grime patch above the screen and cut visible notches out of the
 * bezel's top corners. That patch has its own rect below instead.
 */
export const SCREEN_RECT = { x: 0, y: 640, width: 368, height: 302 }

/**
 * The patch of case grime sitting just above the screen in the atlas.
 *
 * The screen quad samples it, so left alone it shows through in the screen's
 * top-left corner. Covering it with its own small rect rather than by extending
 * SCREEN_RECT upward keeps the wipe away from the bezel corners.
 */
export const BLOB_RECT = { x: 274, y: 524, width: 128, height: 124 }

/** Longest edge of the model once normalised, in world units. */
export const MODEL_SIZE = 4

/** Burned into the screen itself. Warm amber, pulled toward the site's yellow. */
export const PHOSPHOR = '#ffcf1f'

/**
 * How the clip is drawn onto the tube.
 *
 * The clip is not painted into the model's texture atlas the way the old slides
 * were. Repainting a 1024px atlas every frame means a 4MB texture upload per
 * frame and a full pixel loop on the CPU to do the phosphor tint; a quad in
 * front of the glass with the tint in its fragment shader costs neither.
 *
 * It blends additively, which is what keeps the glass. An opaque plate over the
 * tube would hide the Glass mesh's specular entirely; adding light instead means
 * the clip's black leaves the glass and the darkened tube showing through, and
 * only the lit glyphs land on top — which is what a lit phosphor actually does.
 */
export const SCREEN_VIDEO = {
  /**
   * Fraction of the Glass mesh's measured bounds the picture fills.
   *
   * The mesh bounds include the curve out to the bezel lip, so filling them
   * exactly pushes the picture under the surround. Calibrated from renders.
   */
  inset: 0.9,
  /**
   * Distance in front of the glass centre to hang the quad, in world units.
   *
   * It has to clear the glass, not sit behind it: the Glass material is
   * transparent but still writes depth, so a quad behind it is depth-rejected
   * and never drawn. The mesh bulges about 0.17 forward of its centre.
   */
  offset: 0.2,
  /** The clip's own aspect. Cropped, not letterboxed — see ScreenVideo. */
  aspect: 4 / 3,
  /**
   * How the clip's brightness becomes phosphor.
   *
   * `luma` ramps it: every level of grey maps to a level of glow, which keeps
   * photographic gradation and reads as a tube showing a picture.
   *
   * `mask` keys it: anything above the threshold is lit phosphor at full
   * strength, anything below is dark glass, and nothing in between survives.
   * This is what the old word slides did, except they keyed on the artwork's
   * alpha channel because it had one. Video does not, so the key runs off
   * brightness instead, and the result is the same flat, graphic fill. It
   * throws the picture away, so it suits line art and not footage.
   */
  tone: 'luma' as 'luma' | 'mask',

  /**
   * Where `mask` cuts, and how soft the cut is, in luma from 0 to 1.
   *
   * Raise `keyLow` to drop more of the picture into black and keep only what is
   * genuinely lit; lower it to keep more. The gap between the two is the only
   * thing standing between the key and hard aliased edges, so keep some.
   *
   * One threshold has to serve the whole clip, so how much survives tracks how
   * the footage was lit: a bright arena shot fills the tube and a dark one
   * leaves a sliver. That is the cost of keying rather than ramping, and the
   * alternative is measuring each frame's brightness on the CPU, which is the
   * per-frame work this shader exists to avoid.
   */
  keyLow: 0.38,
  keyHigh: 0.55,

  /**
   * Curve applied to the clip's brightness under `luma`, and ignored by `mask`.
   *
   * Above 1 the mid-tones tighten, which stops the bloom smearing bright areas
   * into each other at the emissive strength the screen runs at.
   */
  gamma: 1.6,
  /** Ceiling on the brightest phosphor a frame may reach. */
  gain: 0.92,
  /**
   * How much of the clip's own colour survives, from 0 for a pure amber
   * monochrome tube to 1 for the clip's own hues at phosphor brightness.
   *
   * One, so the footage keeps its colour. Safe to turn freely: the clip's hue
   * and the phosphor are both normalised to unit luma before they mix, so this
   * changes hue only. It cannot change how hard a pixel glows, and so cannot
   * change which pixels breach the bloom threshold.
   *
   * Drop it toward zero for the amber monochrome tube the word slides used.
   */
  chroma: 1,
  /** Dark rows across the tube: how many, and how far each one dims. */
  scanlines: 100,
  scanlineDepth: 0.34,
  /** How far the tube falls off toward the bezel. */
  falloff: 0.55
}

/** The spill thrown by the screen. Warmer than the phosphor so it reads as bounce. */
export const SPILL = '#ffa72e'

/** Cold rim, opposing the warm key to separate the silhouette from the black. */
export const RIM = '#6f9dff'

/**
 * The red that floods the street in the album artwork. Used as a ground wash so
 * the machine reads as standing outside in it rather than in a studio void.
 */
export const FLOOD = '#ff1d2d'

/** Cream of the streetlamp beams in the artwork. */
export const SHAFT = '#ffd8b0'

/**
 * Flicker is deliberately slow and shallow. Fast, high-contrast luminance
 * changes are a photosensitivity risk, so nothing here goes above a couple of
 * hertz or a few percent of amplitude, and it is disabled outright under
 * prefers-reduced-motion.
 */
export const FLICKER = { frequencies: [1.7, 0.6, 0.23], amplitude: 0.055 }

/**
 * Rain is one draw call: a single geometry of camera-facing quads, animated
 * entirely in the vertex shader from a time uniform. Nothing per-drop touches
 * the CPU each frame, so the count can rise without costing frame time — it
 * costs fill rate instead, which is why the drops stay thin and dim.
 */
export const RAIN = {
  count: 1200,
  /** Cylinder the drops fall through, centred on the machine. */
  radius: 13,
  height: 16,
  speed: { min: 6.5, max: 11 },
  length: { min: 0.45, max: 1.1 },
  width: 0.007,
  /** Pronounced lean, matching the long diagonal streaks in the artwork. */
  slant: 0.34,
  colour: '#bcd0ea',
  /** Deliberately faint — present as texture in the air, not as foreground lines. */
  opacity: 0.2
}

/**
 * Black on purpose, and dense enough that the ground fades fully into it
 * before the plane ends.
 *
 * This is what removes the horizon. Any fog colour that differs from the sky
 * leaves a visible line where the two meet, so both are black and the top of
 * the frame just goes dark.
 */
export const FOG = { colour: '#000000', density: 0.05 }

/**
 * Volumetric smoke, as a stack of scrolling noise planes at different depths.
 *
 * Replaces an earlier attempt at billboard puffs. Those rendered fine but read
 * as flat: individual soft blobs do not parallax against each other, so nothing
 * suggested depth. Layered planes do, which is why this is the shape most sites
 * doing convincing volumetrics settle on.
 *
 * Cheap in geometry and expensive in fill rate — each layer covers much of the
 * frame — so the count drops on the low tier rather than the opacity.
 */
export const FOG_LAYERS = {
  count: 9,
  lowCount: 5,
  /**
   * A pale blue-grey, cold against the amber screen and the red street, and a
   * vertical gradient rather than one colour: lit up where the smoke reads
   * against the dark sky, sinking to near-black as it approaches the ground.
   *
   * Fading the colour as well as the alpha is what makes it meet the floor
   * cleanly. Alpha alone still leaves a pale film lying over the ground, and
   * the join shows as a band.
   */
  colourHigh: '#c3ced9',
  colourLow: '#080a0e',
  opacity: 0.075,
  seed: 90210
}

/**
 * Puddles are a roughness map on the floor plane that already exists, so they
 * add no draw call and no reflection pass. Smooth patches pick up the
 * environment and — more importantly — a real amber specular from the screen's
 * area light, which is what makes them read as wet.
 */
export const PUDDLES = {
  /** World units the map spans. Outside this the floor clamps to dry. */
  area: 28,
  /** Soft blobs carry no fine detail, so half resolution is invisible here and
      keeps three of these maps cheap in texture memory. */
  resolution: 512,
  count: 34,
  /** Fixed so the layout is art-directed rather than different every reload. */
  seed: 20260731
}
