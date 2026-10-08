'use client'

import * as React from 'react'
import { useReducedMotion } from 'framer-motion'
import { terminalFont } from '@/components/terminalFont'
import { MAX_INPUT, type GateResponse } from '@/lib/gate'
import { submitAnswer } from './submitAnswer'

type Reveal = Extract<GateResponse, { stage: 'reveal' }>

/**
 * The screens after the CRT, drawn as if the page were now the tube itself:
 * amber phosphor, a soft glow and scanlines over plain DOM text.
 */
function TerminalScreen({
  shown,
  onPress,
  children
}: {
  shown: boolean
  /** Any tap on the screen, so a phone can be given focus where it is needed. */
  onPress?: () => void
  children: React.ReactNode
}) {
  // Mounted at 0 and raised a frame later, or the browser never sees a change
  // to transition from and the screen cuts in instead of fading.
  const [entered, setEntered] = React.useState(false)
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      className={`${terminalFont.className} fixed inset-0 flex items-center justify-center bg-black px-6 text-2xl leading-snug text-[#ffcf1f] transition-opacity ease-out [text-shadow:0_0_8px_rgb(255_207_31/0.55)] sm:text-3xl`}
      style={{
        opacity: shown && entered ? 1 : 0,
        transitionDuration: `${TERMINAL_FADE_MS}ms`
      }}
      onClick={onPress}
    >
      <div className="w-full max-w-xl">{children}</div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0_2px,rgb(0_0_0/0.35)_2px_3px)]"
      />
    </div>
  )
}

export const TERMINAL_FADE_MS = 900

/**
 * Types `text` out a character at a time. Any key or tap finishes it at once,
 * and reduced motion skips straight to the end.
 */
function useTypewriter(text: string) {
  const reducedMotion = useReducedMotion() ?? false
  const [count, setCount] = React.useState(reducedMotion ? text.length : 0)
  const done = count >= text.length

  React.useEffect(() => {
    if (done) return
    const timer = setTimeout(() => setCount((current) => current + 1), CHAR_MS)
    return () => clearTimeout(timer)
  }, [count, done])

  React.useEffect(() => {
    if (done) return
    const skip = () => setCount(text.length)
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
    }
  }, [done, text])

  React.useEffect(() => {
    if (reducedMotion) setCount(text.length)
  }, [reducedMotion, text])

  return { typed: text.slice(0, count), done, reducedMotion }
}

const CHAR_MS = 38

/** Typed text, with the full text kept for screen readers from the start. */
function Typed({ text, typed }: { text: string; typed: string }) {
  return (
    <p className="whitespace-pre-line">
      <span className="sr-only">{text}</span>
      <span aria-hidden>{typed}</span>
    </p>
  )
}

export function Riddle({
  riddle,
  coordinate,
  shown,
  onSolved
}: {
  riddle: string
  /** Resent with the answer, which the server checks again. */
  coordinate: string
  shown: boolean
  onSolved: (reveal: Reveal) => void
}) {
  const { typed, done, reducedMotion } = useTypewriter(riddle)
  const [answer, setAnswer] = React.useState('')
  const input = React.useRef<HTMLInputElement>(null)
  const pending = React.useRef(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (pending.current || !answer.trim()) return
    pending.current = true
    const result = await submitAnswer({ coordinate, answer })

    // Left pending once solved, so Enter during the fade out cannot resubmit.
    if (result?.stage === 'reveal') {
      onSolved(result)
      return
    }
    pending.current = false
    setAnswer('')
    // Animated in place rather than by remounting the input, which would drop
    // focus and close the phone keyboard on every wrong answer.
    if (!reducedMotion) input.current?.animate(JITTER, { duration: 180 })
  }

  return (
    // iOS ignores autoFocus without a tap, so any tap on the screen focuses.
    <TerminalScreen shown={shown} onPress={() => input.current?.focus()}>
      <Typed text={riddle} typed={typed} />
      {done && (
        <form onSubmit={submit} className="mt-8 flex gap-3">
          <span aria-hidden>&gt;</span>
          <input
            ref={input}
            autoFocus
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            aria-label="Answer"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            maxLength={MAX_INPUT}
            className="min-w-0 flex-1 bg-transparent caret-[#ffcf1f] outline-none [caret-shape:block]"
          />
        </form>
      )}
    </TerminalScreen>
  )
}

/** One line of the tube losing sync for a moment. */
const JITTER: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-6px)' },
  { transform: 'translateX(5px)' },
  { transform: 'translateX(-2px)' },
  { transform: 'translateX(0)' }
]

export function RevealScreen({
  reveal,
  shown
}: {
  reveal: Reveal
  shown: boolean
}) {
  const text = `${reveal.title}\n${reveal.date}`
  const { typed, done } = useTypewriter(text)

  return (
    <TerminalScreen shown={shown}>
      <Typed text={text} typed={typed} />
      {done && reveal.link && (
        <a
          href={reveal.link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block underline underline-offset-4 hover:no-underline focus-visible:no-underline focus-visible:outline-none"
        >
          &gt; {reveal.link.label}
        </a>
      )}
    </TerminalScreen>
  )
}
