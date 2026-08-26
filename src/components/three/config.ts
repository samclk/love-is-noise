export const MODEL_URL = '/models/old-computer.glb'
/**
 * WebP, not the PNG. This is only ever a source for the canvas that paints the
 * screen, never displayed, so next/image cannot optimise it and the full 380 KB
 * was landing on every visit. The alpha mask — which is the whole effect —
 * survives the conversion unchanged. /epk still uses the PNG, where next/image
 * does optimise it.
 */
export const LOGO_URL = '/img/lin-scythe-logo.webp'
export const DISCORD_URL = '/img/discord.webp'
export const PRESAVE_URL = '/img/ep-presave.webp'
export const LIVE_URL = '/img/live.webp'
export const MERCH_URL = '/img/merch.webp'

/**
 * Where the band's merch actually lives.
 *
 * Three regions with three separate storefronts, which is why Merch opens a
 * chooser rather than a link — there is no single correct destination, and
 * guessing someone's region is worse than asking. The fourth has no href, which
 * is exactly the shape the existing Button component already renders as plain
 * text rather than a link.
 */
export const STORES = [
  { label: 'uk store', href: 'https://shop.loveisnoise.world' },
  { label: 'us store', href: 'https://loveisnoise-world.myshopify.com/' },
  {
    label: 'eu store',
    href: 'https://www.impericon.com/collections/love-is-noise/'
  },
  { label: 'aus/sea store', message: '(coming soon)' }
]

/** What clicking a slide does. */
export type SlideAction =
  | { kind: 'link'; href: string; label: string }
  | { kind: 'stores'; label: string }

/**
 * How a slide's artwork becomes phosphor.
 *
 * `mask` is for light-on-transparent line art: the alpha *is* the artwork, so a
 * flat phosphor fill composited through it recolours the glyphs and leaves the
 * tube black around them.
 *
 * `luma` is for opaque, full-frame artwork. It has no alpha to mask with, so
 * `mask` would fill the whole screen rect with solid phosphor — a glowing
 * square with the picture thrown away. This maps the artwork's own brightness
 * onto the phosphor instead, the way an amber monochrome tube would show it.
 */
export type SlideTone = 'mask' | 'luma'

export type Slide = {
  /** Artwork burned into the tube. */
  image: string
  /** Set this to match the artwork, or the screen will not show what you expect. */
  tone: SlideTone
  /** Null slides are not interactive. */
  action: SlideAction | null
}

/**
 * What the CRT cycles through.
 *
 * A logo between every word, so the screen keeps returning to the band rather
 * than reading as a run of adverts.
 *
 * That spacing is also what makes a per-slide destination safe. A target that
 * changes under a resting pointer can send someone somewhere they did not
 * choose, so every other slide is inert: a click that lands a beat late lands
 * on the logo and does nothing.
 *
 * The words are committed artwork, not text drawn at runtime: the logo is
 * distressed rather than clean type, and words set live beside it look like a
 * different design.
 */
export const SLIDES: Slide[] = [
  { image: LOGO_URL, tone: 'mask', action: null },
  {
    image: DISCORD_URL,
    tone: 'mask',
    action: {
      kind: 'link',
      href: 'https://discord.gg/skHFhyZKc2',
      label: 'join the discord'
    }
  },
  { image: LOGO_URL, tone: 'mask', action: null },
  {
    image: PRESAVE_URL,
    tone: 'mask',
    action: {
      kind: 'link',
      href: 'https://loveisnoise.bfan.link/the-space-between-happiness-and-heartache',
      label: 'pre-save the ep'
    }
  },
  { image: LOGO_URL, tone: 'mask', action: null },
  {
    image: LIVE_URL,
    tone: 'mask',
    action: {
      kind: 'link',
      href: 'https://www.bandsintown.com/a/245374-love-is-noise',
      label: 'live dates and tickets'
    }
  },
  { image: LOGO_URL, tone: 'mask', action: null },
  {
    image: MERCH_URL,
    tone: 'mask',
    action: { kind: 'stores', label: 'shop merch' }
  }
]

/** How long each slide holds, and how long the tube dims across the swap. */
export const SLIDESHOW = { holdMs: 1500, dipMs: 320 }

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

/**
 * Where slide artwork is placed, kept separate from the wipe above.
 *
 * The quad's exact UV bounds cannot be derived from the geometry — the glass
 * and case meshes sit under different node transforms, and the atlas region is
 * shared — so this box was calibrated from renders instead, measuring the
 * artwork against the screen's centre and moving the box until it sat true.
 *
 * Its centre must track SCREEN_RECT's. It drifted 19px above it when that rect
 * was retuned to stop the wipe catching the bezel corners, which tipped every
 * slide visibly high on the tube.
 */
export const LOGO_RECT = { x: 0, y: 643, width: 363, height: 296 }

/** Longest edge of the model once normalised, in world units. */
export const MODEL_SIZE = 4

/** Burned into the screen itself. Warm amber, pulled toward the site's yellow. */
export const PHOSPHOR = '#ffcf1f'

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
