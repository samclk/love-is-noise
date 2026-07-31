'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { useProgress } from '@react-three/drei'
import { SLIDES, type SlideAction } from './config'
import { StoreDialog } from './StoreDialog'

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
  const [storesOpen, setStoresOpen] = React.useState(false)

  const reveal = React.useCallback(() => setRevealed(true), [])
  const closeStores = React.useCallback(() => setStoresOpen(false), [])

  const activate = React.useCallback((action: SlideAction) => {
    if (action.kind === 'stores') {
      setStoresOpen(true)
      return
    }
    window.open(action.href, '_blank', 'noopener,noreferrer')
  }, [])

  return (
    <>
      {/* The cycle holds while the dialog is up: the screen behind it should not
          carry on changing under a panel the screen itself opened. */}
      <Scene onReady={reveal} onActivate={activate} paused={storesOpen} />
      <Curtain revealed={revealed} onTimeout={reveal} />
      <SceneProgress revealed={revealed} />
      <ScreenLinks onStores={() => setStoresOpen(true)} />
      <StoreDialog open={storesOpen} onClose={closeStores} />
    </>
  )
}

/**
 * The screen's destinations as real controls.
 *
 * The CRT is clickable, but a hit target inside a canvas does not exist for a
 * keyboard or a screen reader, and these are the page's primary calls to
 * action. Everything is listed permanently rather than following the slideshow,
 * so nobody has to wait for the right slide to come round — and there is no
 * race to lose. They become visible on focus, so a sighted keyboard user can
 * see where they are.
 */
function ScreenLinks({ onStores }: { onStores: () => void }) {
  const shared =
    'sr-only focus:not-sr-only focus:m-3 focus:inline-block focus:bg-black focus:px-4 focus:py-2 focus:font-styled focus:text-lg focus:text-white focus:outline focus:outline-white'

  return (
    <nav aria-label="Shop and tickets" className="fixed bottom-0 left-0 z-30">
      <ul className="flex">
        {SLIDES.map((slide) => {
          const action = slide.action
          if (!action) return null

          return (
            <li key={action.label}>
              {action.kind === 'link' ? (
                <a
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={shared}
                >
                  {action.label}
                </a>
              ) : (
                <button type="button" onClick={onStores} className={shared}>
                  {action.label}
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
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
