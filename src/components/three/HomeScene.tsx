'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { useProgress } from '@react-three/drei'
import {
  RevealScreen,
  Riddle,
  TERMINAL_FADE_MS
} from '@/components/gate/Terminal'
import { submitAnswer } from '@/components/gate/submitAnswer'
import type { GateResponse } from '@/lib/gate'
import { countSlots, fillTemplate } from '@/lib/template'
import { POWER_OFF, PROMPT } from './config'

/**
 * The Canvas touches browser APIs on mount and cannot render on the server.
 * Next disallows `ssr: false` inside a Server Component, so the dynamic import
 * has to happen from a client boundary like this one.
 */
const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => <SceneFallback />
})

/**
 * The page is a three-step puzzle: a coordinate typed at the CRT switches the
 * tube off and leads to a riddle, and the riddle's answer leads to the reveal.
 * The server checks every answer and holds every stage's content.
 *
 * Each fade is a stage of its own, so whatever is fading out stays mounted
 * until it is covered and no answer can be resubmitted mid-fade.
 */
type Reveal = Extract<GateResponse, { stage: 'reveal' }>
type Unlocked = { coordinate: string; riddle: string }
type Stage =
  | { name: 'gate' }
  | ({ name: 'poweringOff' } & Unlocked)
  | ({ name: 'leaving' } & Unlocked)
  | ({ name: 'riddle' } & Unlocked)
  | ({ name: 'solved'; reveal: Reveal } & Unlocked)
  | { name: 'reveal'; reveal: Reveal }

export function HomeScene() {
  const [stage, setStage] = React.useState<Stage>({ name: 'gate' })
  const [sceneShown, setSceneShown] = React.useState(false)
  const showScene = React.useCallback(() => setSceneShown(true), [])

  const [digits, setDigits] = React.useState('')
  const entry = fillTemplate(PROMPT.template, digits)
  const [rejections, setRejections] = React.useState(0)
  const input = React.useRef<HTMLInputElement>(null)
  const [focused, setFocused] = React.useState(false)
  const touch = useTouchPrimary()
  // A phone frames the glass while typing and holds it through the power-off,
  // since an answer can only be submitted from the zoomed-in prompt.
  const zoomed = touch && (focused || stage.name !== 'gate')

  const focusPrompt = React.useCallback(() => {
    if (sceneShown) input.current?.focus()
  }, [sceneShown])

  // Desktop only: a phone ignores a focus it was not tapped into, and would
  // keep the keyboard down anyway. There the first tap on the scene does it.
  React.useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) focusPrompt()
  }, [focusPrompt])

  // Filling the last slot is the submit: a phone's number pad has no Return
  // key. The pause lets the final digit show on the glass before the tube reacts.
  const complete = entry.next === null
  const coordinate = entry.text
  React.useEffect(() => {
    if (!complete || stage.name !== 'gate') return
    let cancelled = false
    const timer = setTimeout(async () => {
      const result = await submitAnswer({ coordinate })
      if (cancelled) return
      if (result?.stage === 'riddle') {
        input.current?.blur()
        setStage({ name: 'poweringOff', coordinate, riddle: result.riddle })
        return
      }
      setDigits('')
      setRejections((count) => count + 1)
    }, SUBMIT_PAUSE_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [complete, coordinate, stage.name])

  const leave = React.useCallback(
    () =>
      setStage((current) =>
        current.name === 'poweringOff'
          ? { ...current, name: 'leaving' }
          : current
      ),
    []
  )

  // Every fade ends on a timer. The power-off normally ends early, when the
  // tube reports itself dark; the timer covers a frame loop that has stopped.
  React.useEffect(() => {
    const next =
      stage.name === 'poweringOff'
        ? { ms: POWER_OFF_FALLBACK_MS, run: leave }
        : stage.name === 'leaving'
          ? { ms: FADE_MS, run: () => setStage({ ...stage, name: 'riddle' }) }
          : stage.name === 'solved'
            ? {
                ms: TERMINAL_FADE_MS,
                run: () => setStage({ name: 'reveal', reveal: stage.reveal })
              }
            : null
    if (!next) return
    const timer = setTimeout(next.run, next.ms)
    return () => clearTimeout(timer)
  }, [stage, leave])

  if (stage.name === 'riddle' || stage.name === 'solved') {
    return (
      <Riddle
        riddle={stage.riddle}
        coordinate={stage.coordinate}
        shown={stage.name === 'riddle'}
        onSolved={(reveal) => setStage({ ...stage, name: 'solved', reveal })}
      />
    )
  }

  if (stage.name === 'reveal') {
    return <RevealScreen reveal={stage.reveal} shown />
  }

  return (
    <>
      <Scene
        onReady={showScene}
        onPress={focusPrompt}
        text={entry.text}
        cursorAt={entry.next ?? entry.text.length}
        rejections={rejections}
        off={stage.name !== 'gate'}
        onPoweredOff={leave}
        zoomed={zoomed}
        raised={touch && focused}
      />
      {/* The CRT is a texture, so keystrokes land here and are painted onto it.
          Invisible but focusable, since a phone only raises its keyboard for that. */}
      <form onSubmit={(event) => event.preventDefault()}>
        <input
          ref={input}
          value={digits}
          // Paste works too: a pasted coordinate keeps only its digits, in order.
          onChange={(event) =>
            setDigits(event.target.value.replace(/\D/g, '').slice(0, SLOTS))
          }
          inputMode="numeric"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-label="Coordinates"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={stage.name !== 'gate'}
          // 16px is the size below which iOS zooms the page on focus.
          className="pointer-events-none fixed top-1/3 left-1/2 w-px text-[16px] opacity-0"
        />
      </form>
      <Curtain
        opaque={!sceneShown || stage.name === 'leaving'}
        onTimeout={showScene}
      />
      <SceneProgress revealed={sceneShown} />
    </>
  )
}

/** Touch is the primary input, i.e. a phone or tablet rather than a laptop with a touchscreen. */
function useTouchPrimary() {
  const [touch, setTouch] = React.useState(false)
  React.useEffect(() => {
    setTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [])
  return touch
}

function SceneFallback() {
  return <div className="fixed inset-0 h-dvh w-full bg-black" />
}

const SLOTS = countSlots(PROMPT.template)

const SUBMIT_PAUSE_MS = 300

const FADE_MS = 1400

/** The whole power-off plus a second's grace. */
const POWER_OFF_FALLBACK_MS =
  POWER_OFF.squashMs + POWER_OFF.shrinkMs + POWER_OFF.fadeMs + 1000

/**
 * The black the scene fades up from on arrival, and back down to once the tube
 * has switched off.
 *
 * The timeout is a safety line, not a schedule. The reveal is driven by the
 * scene reporting itself composed, and if anything on that path fails — a
 * texture that never decodes, a model that never resolves — the page would
 * otherwise sit on black forever. Better to show an unfinished scene than
 * nothing at all.
 */
function Curtain({
  opaque,
  onTimeout
}: {
  opaque: boolean
  onTimeout: () => void
}) {
  React.useEffect(() => {
    if (!opaque) return
    const timer = setTimeout(onTimeout, 8000)
    return () => clearTimeout(timer)
  }, [opaque, onTimeout])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-10 bg-black transition-opacity ease-out"
      style={{
        opacity: opaque ? 1 : 0,
        transitionDuration: `${FADE_MS}ms`
      }}
    />
  )
}

/** The model is the entire hero, so there is nothing else to look at while it loads. */
function SceneProgress({ revealed }: { revealed: boolean }) {
  const { active, progress } = useProgress()

  // Sits above the curtain rather than behind it, and goes the moment the fade
  // starts so it is never caught halfway through the reveal.
  if (!active || revealed) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex items-end justify-center pb-16">
      <div className="flex flex-col items-center gap-3">
        <div className="h-px w-40 overflow-hidden bg-white/15">
          <div
            className="h-full bg-white/70 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-styled text-xs tracking-widest text-white/40">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  )
}
