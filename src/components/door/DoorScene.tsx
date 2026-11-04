'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { RevealScreen, Riddle, TERMINAL_FADE_MS } from '../gate/Terminal'
import { submitAnswer } from '../gate/submitAnswer'
import type { GateResponse } from '@/lib/gate'

/**
 * The Canvas touches browser APIs on mount, and Next disallows `ssr: false`
 * inside a Server Component, so the dynamic import lives behind this boundary.
 */
const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 h-dvh w-full bg-black" />
})

/**
 * Opening the door asks the server for the riddle while the door swings, then
 * the scene fades to black and the riddle takes over. Each fade is a stage of
 * its own, so nothing can be pressed or answered twice mid-transition.
 */
type Reveal = Extract<GateResponse, { stage: 'reveal' }>
type Stage =
  | { name: 'door' }
  | { name: 'opening' }
  | { name: 'leaving'; riddle: string }
  | { name: 'riddle'; riddle: string }
  | { name: 'solved'; riddle: string; reveal: Reveal }
  | { name: 'reveal'; reveal: Reveal }

export function DoorScene() {
  const [stage, setStage] = React.useState<Stage>({ name: 'door' })
  const [shown, setShown] = React.useState(false)
  const show = React.useCallback(() => setShown(true), [])

  // A safety line: if the model never resolves, show the unfinished scene
  // rather than black forever.
  React.useEffect(() => {
    const timer = setTimeout(show, 8000)
    return () => clearTimeout(timer)
  }, [show])

  const openDoor = React.useCallback(
    () =>
      setStage((current) =>
        current.name === 'door' ? { name: 'opening' } : current
      ),
    []
  )

  // The fade waits for both the riddle and a moment of the door swinging. If
  // the riddle never comes, the door swings shut again and can be tried again.
  React.useEffect(() => {
    if (stage.name !== 'opening') return
    let cancelled = false
    Promise.all([submitAnswer({}), wait(FADE_DELAY_MS)]).then(([result]) => {
      if (cancelled) return
      setStage(
        result?.stage === 'riddle'
          ? { name: 'leaving', riddle: result.riddle }
          : { name: 'door' }
      )
    })
    return () => {
      cancelled = true
    }
  }, [stage.name])

  React.useEffect(() => {
    const next =
      stage.name === 'leaving'
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
  }, [stage])

  if (stage.name === 'riddle' || stage.name === 'solved') {
    return (
      <Riddle
        riddle={stage.riddle}
        shown={stage.name === 'riddle'}
        onSolved={(reveal) => setStage({ ...stage, name: 'solved', reveal })}
      />
    )
  }

  if (stage.name === 'reveal') {
    return <RevealScreen reveal={stage.reveal} shown />
  }

  const leaving = stage.name === 'leaving'

  return (
    <>
      <Scene
        onReady={show}
        open={stage.name !== 'door'}
        onDoorPress={openDoor}
      />
      {/* The door is only clickable in the canvas, so keyboard and screen
          reader users get a real button. It shows itself when focused. */}
      <button
        type="button"
        onClick={openDoor}
        disabled={!shown || stage.name !== 'door'}
        className="sr-only z-20 focus-visible:not-sr-only focus-visible:fixed focus-visible:bottom-10 focus-visible:left-1/2 focus-visible:-translate-x-1/2 focus-visible:text-white/80 focus-visible:outline-none"
      >
        Open the door
      </button>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-10 bg-black transition-opacity ease-out"
        style={{
          opacity: !shown || leaving ? 1 : 0,
          transitionDuration: `${leaving ? FADE_MS : ARRIVE_MS}ms`
        }}
      />
    </>
  )
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const ARRIVE_MS = 2400
/** From the click to the fade starting, so the door is seen to swing first. */
const FADE_DELAY_MS = 1100
const FADE_MS = 1600
