/**
 * One-off optimisation for the homepage GLB.
 *
 * Almost all of this model's weight is four 1024px PNGs, not geometry (it is
 * only ~18.7k verts), so geometry compression is not worth the runtime decoder.
 * Instead: downscale the maps nobody can resolve at our camera distance, then
 * re-encode everything as WebP.
 *
 * Run with: node scripts/optimise-model.mjs
 */
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, EXTTextureWebP } from '@gltf-transform/extensions'
import sharp from 'sharp'

// The source is the untouched Sketchfab export, kept out of git for its size.
// The optimised output is what ships and what is committed.
const INPUT = 'public/models/old-computer.source.glb'
const OUTPUT = 'public/models/old-computer.glb'

// The base colour and emissive maps are read directly by the eye, so they keep
// their resolution. Normal and metallic-roughness/occlusion only modulate
// shading and hold up fine at half size in a scene this dark.
const FULL_RES_SLOTS = new Set(['baseColorTexture', 'emissiveTexture'])
const REDUCED_SIZE = 512

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
const document = await io.read(INPUT)
const root = document.getRoot()

// Declaring the extension is what makes the WebP payloads spec-conformant.
// Without it, loaders are only able to decode them by inferring from the
// image mime type, which is an implementation detail rather than a guarantee.
document.createExtension(EXTTextureWebP).setRequired(true)

// A texture can be referenced from more than one slot (here, one image serves
// as both occlusion and metallic-roughness), so collect every slot each one
// fills before deciding how to treat it.
const slotsByTexture = new Map()
for (const material of root.listMaterials()) {
  for (const edge of document.getGraph().listEdges()) {
    if (edge.getParent() !== material) continue
    const child = edge.getChild()
    if (!root.listTextures().includes(child)) continue
    if (!slotsByTexture.has(child)) slotsByTexture.set(child, new Set())
    slotsByTexture.get(child).add(edge.getName())
  }
}

let before = 0
let after = 0

for (const texture of root.listTextures()) {
  const image = texture.getImage()
  if (!image) continue
  before += image.byteLength

  const slots = slotsByTexture.get(texture) ?? new Set()
  const keepFullRes = [...slots].some((slot) => FULL_RES_SLOTS.has(slot))

  let pipeline = sharp(Buffer.from(image))
  if (!keepFullRes) {
    pipeline = pipeline.resize(REDUCED_SIZE, REDUCED_SIZE, { fit: 'fill' })
  }

  // Normal maps encode direction in the colour channels, so lossy artefacts
  // show up as visible shading noise. Everything else can take real
  // compression.
  const isNormal = slots.has('normalTexture')
  pipeline = isNormal
    ? pipeline.webp({ nearLossless: true, effort: 6 })
    : pipeline.webp({ quality: 82, effort: 6 })

  const encoded = await pipeline.toBuffer()
  texture.setImage(new Uint8Array(encoded)).setMimeType('image/webp')
  after += encoded.byteLength

  const label = [...slots].join(', ') || 'unused'
  const size = keepFullRes ? '1024' : String(REDUCED_SIZE)
  console.log(
    `  ${label.padEnd(46)} ${size.padStart(4)}px  ` +
      `${(image.byteLength / 1024).toFixed(0).padStart(4)} KB → ` +
      `${(encoded.byteLength / 1024).toFixed(0).padStart(4)} KB`
  )
}

await io.write(OUTPUT, document)

console.log(
  `\ntextures ${(before / 1024 / 1024).toFixed(2)} MB → ` +
    `${(after / 1024 / 1024).toFixed(2)} MB`
)
