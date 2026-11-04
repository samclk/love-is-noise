export const MODEL_URL = '/models/door_with_door_frame.glb'

/**
 * The grade's palette, after the "black sheep." artwork: cold teal-blue
 * shadows, pale mint haze, nothing fully saturated. Bliss, seen through fog.
 */
export const PALETTE = {
  /** Where the sky meets the land. Fog uses it too, so the far hills melt into it. */
  haze: '#8fb0b2',
  zenith: '#2a5262',
  sunGlow: '#eef8f2',
  cloud: '#dbe9e6',
  grassLight: '#5f9a5e',
  grassDark: '#2c5a44',
  rock: '#5d7480',
  /** Trodden earth, pale and muted so the grade turns it grey-green rather than brown. */
  path: '#a29c84'
}

/** Thin enough that the door reads clearly, thick enough that the mountains are ghosts. */
export const FOG_DENSITY = 0.0062

export const CAMERA = {
  /** Vertical field of view on a landscape screen. Portrait widens it to keep the hills in. */
  fov: 30,
  distance: 26,
  /** Above the door's base, so the shot looks across the crest into the valleys. */
  height: 2.6,
  /** The point the shot centres on: roughly the middle of the door. */
  target: [0, 1.25, 0] as const,
  /** Where the push-in ends once the door opens: just short of the doorway, at eye height. */
  through: [0, 1.15, 0.7] as const,
  /** Reaches the doorway just before the fade to black completes. */
  approachSeconds: 2.6
}

export const DOOR = {
  /** How far the slab swings away from the camera. */
  openDegrees: 100,
  openSeconds: 2.2
}

/** A column of rain over the door and nowhere else. */
export const RAIN = {
  count: 750,
  /** Footprint of the column. Drops thin out towards its edges rather than stopping dead. */
  width: 1.9,
  depth: 1.1,
  /** Where drops appear, above the ground. */
  top: 7.5,
  speed: { min: 6, max: 8 },
  length: { min: 0.2, max: 0.38 },
  /** World units across. Around a pixel at this distance, so the fragment softens it. */
  streakWidth: 0.022,
  colour: '#eef8f7',
  opacity: 0.65,
  /** How long a splash shows after a drop lands, in seconds. */
  splashSeconds: 0.16,
  seed: 4417
}

export const MIST = {
  count: 6,
  colour: '#cfe0dc',
  opacity: 0.16,
  seed: 1979
}
