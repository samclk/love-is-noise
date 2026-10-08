'use client'

import * as React from 'react'
import { useReducedMotion } from 'framer-motion'
import { terminalFont } from '@/components/terminalFont'
import type { GateResponse } from '@/lib/gate'
import { countSlots, fillTemplate } from '@/lib/template'
import { submitAnswer } from './submitAnswer'

type Reveal = Extract<GateResponse, { stage: 'reveal' }>

/**
 * The screens after the CRT, drawn as if the page were now the tube itself:
 * phosphor-coloured text, a soft glow and scanlines over plain DOM text.
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
      className={`${terminalFont.className} fixed inset-0 flex items-center justify-center bg-black px-6 text-2xl leading-snug transition-opacity ease-out sm:text-3xl text-[#8fe1eb] [text-shadow:0_0_8px_rgb(143_225_235/0.55)]`}
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
  const [letters, setLetters] = React.useState('')
  const [focused, setFocused] = React.useState(false)
  const input = React.useRef<HTMLInputElement>(null)
  const line = React.useRef<HTMLParagraphElement>(null)
  const entry = fillTemplate(ANSWER_TEMPLATE, letters)
  // Held in refs so a parent re-render cannot re-arm the submit below, and a
  // solved answer is never sent twice.
  const solve = React.useRef(onSolved)
  solve.current = onSolved
  const solved = React.useRef(false)

  // Filling the last slot is the submit, as on the CRT. The pause lets the
  // final letter show before the screen reacts.
  const complete = entry.next === null
  const answer = entry.text
  React.useEffect(() => {
    if (!complete || solved.current) return
    let cancelled = false
    const timer = setTimeout(async () => {
      const result = await submitAnswer({ coordinate, answer })
      if (cancelled) return
      if (result?.stage === 'reveal') {
        solved.current = true
        solve.current(result)
        return
      }
      setLetters('')
      if (!reducedMotion) line.current?.animate(JITTER, { duration: 180 })
    }, SUBMIT_PAUSE_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [complete, answer, coordinate, reducedMotion])

  const cursorAt = entry.next ?? answer.length

  return (
    // iOS ignores autoFocus without a tap, so any tap on the screen focuses.
    <TerminalScreen shown={shown} onPress={() => input.current?.focus()}>
      <Typed text={riddle} typed={typed} />
      {done && (
        <p ref={line} className="relative mt-8 whitespace-pre">
          <span aria-hidden>
            &gt; {answer.slice(0, cursorAt)}
            {/* A block cursor on the next slot, shown only while typing is live. */}
            <span className={focused ? 'bg-[#8fe1eb] text-black' : ''}>
              {answer[cursorAt] ?? ' '}
            </span>
            {answer.slice(cursorAt + 1)}
          </span>
          {/* Laid over the line, invisible: it takes the typing, the line shows it. */}
          <input
            ref={input}
            autoFocus
            value={letters}
            onChange={(event) =>
              setLetters(
                event.target.value
                  .replace(/[^a-z]/gi, '')
                  .toLowerCase()
                  .slice(0, ANSWER_SLOTS)
              )
            }
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="Answer"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="absolute inset-0 w-full opacity-0"
          />
        </p>
      )}
    </TerminalScreen>
  )
}

/**
 * Typed letters fill the underscores. Its shape gives away the answer's word
 * lengths, so change it with RIDDLE_ANSWER.
 */
const ANSWER_TEMPLATE = '_____ / _____'
const ANSWER_SLOTS = countSlots(ANSWER_TEMPLATE)
const SUBMIT_PAUSE_MS = 300

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
  const { typed } = useTypewriter(text)

  return (
    <TerminalScreen shown={shown}>
      <Typed text={text} typed={typed} />
    </TerminalScreen>
  )
}
