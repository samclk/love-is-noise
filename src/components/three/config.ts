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
export const RIM = '#7fa8ff'

/**
 * Flicker is deliberately slow and shallow. Fast, high-contrast luminance
 * changes are a photosensitivity risk, so nothing here goes above a couple of
 * hertz or a few percent of amplitude, and it is disabled outright under
 * prefers-reduced-motion.
 */
export const FLICKER = { frequencies: [1.7, 0.6, 0.23], amplitude: 0.055 }
