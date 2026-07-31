/**
 * Renders the CRT's word slides and commits them as WebP.
 *
 * They cannot be generated offline: p22-canterbury-pro is a Typekit face, not
 * installed locally, and there is no blackletter on the machine at all. The
 * browser has already loaded the real face, so the words are drawn there and
 * exported from the page.
 *
 * Requires the dev server running, and playwright available:
 *   yarn dev  # in another terminal
 *   node scripts/make-slide-assets.mjs
 */
import { chromium } from 'playwright'
import { writeFileSync } from 'fs'

const OUT = new URL('../public/img', import.meta.url).pathname

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' })

const slides = await page.evaluate(async () => {
  await document.fonts.ready
  await document.fonts.load('400 300px p22-canterbury-pro')

  // Deterministic speckle, so re-running produces the identical asset.
  let seed = 1337
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }

  function render(word) {
    const size = 300
    const pad = 60

    // Measure first so the canvas hugs the word rather than baking in slack.
    const probe = document.createElement('canvas').getContext('2d')
    probe.font = `400 ${size}px p22-canterbury-pro`
    const m = probe.measureText(word)
    const w = Math.ceil(m.width) + pad * 2
    const ascent = m.actualBoundingBoxAscent
    const descent = m.actualBoundingBoxDescent
    const h = Math.ceil(ascent + descent) + pad * 2

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')

    ctx.font = `400 ${size}px p22-canterbury-pro`
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(word, pad, pad + ascent)

    // The logo is distressed artwork, not clean type. Erode the edges with fine
    // speckle so these words sit in the same world rather than looking freshly
    // set beside it.
    ctx.globalCompositeOperation = 'destination-out'
    const specks = Math.round((w * h) / 900)
    for (let i = 0; i < specks; i++) {
      const x = random() * w
      const y = random() * h
      const r = random() * 2.4 + 0.3
      ctx.globalAlpha = random() * 0.55 + 0.15
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    // A few longer scratches, echoing the broken strokes in the logo.
    for (let i = 0; i < Math.round(w / 26); i++) {
      ctx.globalAlpha = random() * 0.4 + 0.1
      ctx.lineWidth = random() * 1.8 + 0.4
      ctx.beginPath()
      const x = random() * w
      const y = random() * h
      ctx.moveTo(x, y)
      ctx.lineTo(x + (random() - 0.5) * 50, y + (random() - 0.5) * 14)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'

    return {
      word,
      width: w,
      height: h,
      data: canvas.toDataURL('image/webp', 0.92)
    }
  }

  return ['Tickets', 'Merch'].map(render)
})

for (const slide of slides) {
  const name = slide.word.toLowerCase()
  const base64 = slide.data.split(',')[1]
  const bytes = Buffer.from(base64, 'base64')
  writeFileSync(`${OUT}/screen-${name}.webp`, bytes)
  console.log(
    `screen-${name}.webp  ${slide.width}x${slide.height}  ${(bytes.length / 1024).toFixed(1)} KB  (${slide.data.slice(0, 20)}…)`
  )
}

await browser.close()
