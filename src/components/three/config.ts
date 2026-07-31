export const MODEL_URL = '/models/old-computer.glb'
export const LOGO_URL = '/img/lin-scythe-logo.png'

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
 * Where the logo is placed, kept separate from the wipe above.
 *
 * The quad's exact UV bounds cannot be derived from the geometry — the glass
 * and case meshes sit under different node transforms, and the atlas region is
 * shared — so this box was calibrated from renders instead: the logo was
 * measured against the screen's centre and the box moved until it sat true.
 */
export const LOGO_RECT = { x: 0, y: 624, width: 363, height: 296 }

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
  count: 14,
  lowCount: 6,
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
  opacity: 0.055,
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
