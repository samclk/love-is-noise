/**
 * The land's height at any point, in world units. Pure so the mesh, the
 * camera and the door all agree on where the ground is.
 *
 * The door stands on the top of a long crest. Bliss-style rolling hills fade in
 * away from it, and broader, softer swells rise far behind. Nothing between the
 * camera and the door may rise above the door's base, or it hides the door.
 */
export function heightAt(x: number, z: number) {
  const radius = Math.hypot(x, z)

  // Zero along its spine and falling away either side, and rounding off
  // towards the edges of the frame so the skyline is a dome, not a ruler.
  const crest =
    -CREST_HEIGHT * (1 - Math.exp(-(z * z) / (2 * 15 * 15))) -
    6 * (1 - Math.exp(-(x * x) / (2 * 45 * 45)))

  const hills =
    smoothstep(10, 60, radius) *
    (3.2 * Math.sin(x * 0.034 + 1.3) * Math.cos(z * 0.027 - 0.4) +
      2.0 * Math.sin(x * 0.071 - z * 0.048 + 2.1) +
      0.6 * Math.sin(x * 0.16 + z * 0.13))

  // Rolling hills in the middle distance, rising out of the valley mist behind
  // the crest so the land recedes in layers into the haze.
  const valley = smoothstep(25, 80, -z) * (1 - smoothstep(160, 260, -z))
  const middle =
    valley *
    (8 +
      4.5 * Math.sin(x * 0.024 + 0.8) +
      3 * Math.sin(x * 0.061 - z * 0.03 + 2.4) +
      2 * Math.cos(z * 0.05))

  // Long, low swells on the horizon. Rounded, so they read as more hills
  // rather than mountains.
  const behind = smoothstep(110, 260, -z)
  const far =
    behind *
    (16 +
      5 * Math.sin(x * 0.009 + z * 0.004 + 0.6) +
      3 * Math.sin(x * 0.021 - z * 0.008 + 2.2) +
      1.2 * Math.sin(x * 0.047 + 1.1))

  // A level pad for the door to stand on.
  return (crest + hills) * smoothstep(1.5, 8, radius) + middle + far
}

const CREST_HEIGHT = 9

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1)
  return t * t * (3 - 2 * t)
}
