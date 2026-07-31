'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { useProgress } from '@react-three/drei'

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
 * Nothing should be visible until the scene is actually composed, so the page
 * opens on black and fades through to the render.
 *
 * Waiting on load progress alone is not enough — see Curtain.
 */
export function HomeScene() {
  const [revealed, setRevealed] = React.useState(false)
  const reveal = React.useCallback(() => setRevealed(true), [])

  return (
    <>
      <Scene onReady={reveal} />
      <Curtain revealed={revealed} onTimeout={reveal} />
      <SceneProgress revealed={revealed} />
    </>
  )
}

function SceneFallback() {
  return <div className="fixed inset-0 h-screen w-full bg-black" />
}

const FADE_MS = 1400

/**
 * The black the scene fades up from.
 *
 * The timeout is a safety line, not a schedule. The reveal is driven by the
 * scene reporting itself composed, and if anything on that path fails — a
 * texture that never decodes, a model that never resolves — the page would
 * otherwise sit on black forever. Better to show an unfinished scene than
 * nothing at all.
 */
function Curtain({
  revealed,
  onTimeout
}: {
  revealed: boolean
  onTimeout: () => void
}) {
  React.useEffect(() => {
    if (revealed) return
    const timer = setTimeout(onTimeout, 8000)
    return () => clearTimeout(timer)
  }, [revealed, onTimeout])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-10 bg-black transition-opacity ease-out"
      style={{
        opacity: revealed ? 0 : 1,
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
