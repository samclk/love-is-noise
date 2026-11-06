/**
 * Turns the master recording into the encrypted web copy the site serves.
 *
 * The repo is public, so only the encrypted output is ever committed. The WAV
 * stays on your machine, outside public/, and the 128kbps MP3 is made in a
 * temp folder and deleted, so a rip is never the master.
 *
 * Run with: AUDIO_KEY=... npm run encrypt:audio -- path/to/track.wav
 * AUDIO_KEY must be the same value the deployment has.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { encrypt, readMasterKey } from '../src/lib/listen.ts'

const [input, output = 'private/black-sheep.mp3.enc'] = process.argv.slice(2)
const master = readMasterKey(process.env.AUDIO_KEY)

if (!input || !master) {
  console.error(
    'Usage: AUDIO_KEY=<32 bytes, base64> npm run encrypt:audio -- <input.wav> [output]'
  )
  process.exit(1)
}

const scratch = mkdtempSync(join(tmpdir(), 'encrypt-audio-'))
try {
  const mp3 = join(scratch, 'track.mp3')
  // Metadata stripped so the file carries nothing but the audio.
  execFileSync('ffmpeg', [
    '-v',
    'error',
    '-i',
    input,
    '-map_metadata',
    '-1',
    '-codec:a',
    'libmp3lame',
    '-b:a',
    '128k',
    mp3
  ])
  const encrypted = encrypt(master, readFileSync(mp3))
  writeFileSync(output, encrypted)
  console.log(`Wrote ${output} (${Math.round(encrypted.length / 1024)}KB)`)
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
