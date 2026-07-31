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
 * These bounds are a deliberate compromise. The screen and the bezel overlap in
 * this atlas, so no rect wipes one without eating into the other: widening it
 * further blackens the monitor's surround. Calibrated against renders to sit
 * just short of that, which leaves a faint warm cast at the top of the screen
 * that passes for a reflection in the glass.
 */
export const SCREEN_RECT = { x: 0, y: 515, width: 405, height: 425 }

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
 * Heavy enough to dissolve the floor into the sky well before its edge, which
 * is what removes the hard horizon line. The colour is matched to the backdrop's
 * horizon rather than black, so distant ground melts into the sky instead of
 * cutting against it.
 */
export const FOG = { colour: '#12030a', density: 0.05 }

/**
 * Drifting haze layered through the scene, which distance fog cannot do on its
 * own — fog dims by depth and nothing more, where these sit in front of and
 * behind the machine and parallax against it.
 *
 * Billboards are cheap in geometry but pay in fill rate, since each one covers
 * a lot of screen. Hence a low count at low opacity rather than many dense ones.
 */
export const HAZE = {
  count: 16,
  radius: 9,
  height: { min: 0.2, max: 4.2 },
  size: { min: 5, max: 12 },
  /** Warm and desaturated, so it veils toward the street's red, not toward grey. */
  colour: '#5b2a26',
  opacity: 0.26
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
