'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { useProgress } from '@react-three/drei'
import { useReducedMotion } from 'framer-motion'
import { SCREEN_ACTIONS, CLIP_URL } from './config'
import { StoreDialog } from './StoreDialog'
import { useScreenClip, type ScreenClip } from './useScreenClip'

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
  const reducedMotion = useReducedMotion() ?? false

  // Loops on its own from the reveal, so it never runs under the curtain. Not
  // under reduced motion: a clip that starts itself and never stops is the
  // thing that preference exists to prevent, and the button is still there.
  const video = useScreenClip({ start: revealed, autoplay: !reducedMotion })

  const reveal = React.useCallback(() => setRevealed(true), [])
  const openStores = React.useCallback(() => setStoresOpen(true), [])
  const closeStores = React.useCallback(() => setStoresOpen(false), [])

  return (
    <>
      <Scene
        onReady={reveal}
        video={video.element}
        onToggleVideo={video.toggle}
      />
      {/*
        Parked in the corner at a pixel rather than hidden. The clip is a texture
        source, never something anyone looks at here, but `display: none` and
        `visibility: hidden` both let a browser stop decoding — which strands the
        tube on whatever frame it stopped at.
      */}
      <video
        ref={video.attach}
        src={CLIP_URL}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        tabIndex={-1}
        className="pointer-events-none fixed top-0 left-0 -z-50 h-px w-px opacity-0"
      />
      {/*
        The clip carries no words, so a description is the whole of what a
        screen reader can be given. Nothing of the footage reaches one
        otherwise: it is pixels on a texture inside a canvas.
      */}
      <p className="sr-only">
        The computer screen plays a short silent wrestling clip on a loop. The
        play button stops and starts it.
      </p>
      <Curtain revealed={revealed} onTimeout={reveal} />
      <SceneProgress revealed={revealed} />
      <PlayButton video={video} revealed={revealed} />
      <ScreenLinks onStores={openStores} />
      <StoreDialog open={storesOpen} onClose={closeStores} />
    </>
  )
}

/**
 * The only control the page has, so it is the only thing on it that is visible
 * without focusing something.
 *
 * Held back until the reveal, so it does not sit on the black while the scene
 * is still loading and imply there is something to press.
 */
function PlayButton({
  video,
  revealed
}: {
  video: ScreenClip
  revealed: boolean
}) {
  return (
    <button
      type="button"
      onClick={video.toggle}
      aria-label={video.playing ? 'pause the clip' : 'play the clip'}
      style={{ opacity: revealed ? 1 : 0 }}
      // Opacity hides it and nothing else, so before the reveal it would still
      // take focus and still take a click — an invisible control in the corner
      // that starts the clip. `inert` removes it from both.
      inert={!revealed}
      // min-h-11 rather than more padding: the type is small by design, and a
      // thumb still needs 44px of button to land on.
      className="fixed bottom-0 left-0 z-30 m-3 flex min-h-11 items-center gap-2 bg-black/50 px-4 py-2 font-styled text-sm text-white/70 outline outline-white/25 backdrop-blur-xs transition-opacity duration-700 hover:text-white hover:outline-white/60 focus-visible:text-white focus-visible:outline-2 focus-visible:outline-white"
    >
      {/* A triangle and two bars, stated as geometry rather than traced from an
          icon set: there is no artwork here to get wrong. */}
      <svg viewBox="0 0 12 12" aria-hidden className="size-3 fill-current">
        {video.playing ? (
          <>
            <rect x="1.5" y="1" width="3" height="10" />
            <rect x="7.5" y="1" width="3" height="10" />
          </>
        ) : (
          <polygon points="2,1 11,6 2,11" />
        )}
      </svg>
      {video.playing ? 'pause' : 'play'}
    </button>
  )
}

/**
 * The page's calls to action, as real controls.
 *
 * The tube plays the clip and nothing else, so these are the only route to any
 * of them — and they were always the only route for a keyboard or a screen
 * reader, since a hit target inside a canvas does not exist for either.
 *
 * They stack on the same corner rather than in a row: only one can hold focus,
 * so only one is ever visible, and none of them shifts the others as it opens.
 */
function ScreenLinks({ onStores }: { onStores: () => void }) {
  return (
    <>
      {SCREEN_ACTIONS.map((action) =>
        action.kind === 'link' ? (
          <a
            key={action.label}
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className={SCREEN_LINK_CLASS}
          >
            {action.label}
          </a>
        ) : (
          // Merch has no single href — see STORES — so the keyboard path opens
          // the same chooser the glass used to rather than picking a region.
          <button
            key={action.label}
            type="button"
            onClick={onStores}
            className={SCREEN_LINK_CLASS}
          >
            {action.label}
          </button>
        )
      )}
    </>
  )
}

/**
 * Parked off-screen rather than `sr-only`, because `not-sr-only` restores
 * `position: static` and so cancels the `fixed` these need to sit over the
 * canvas — focusing one dropped it behind the scene at the top of the document.
 * A transform hides it without touching layout, so focus brings it back in place.
 *
 * Raised clear of the play button, which now holds the bottom-left corner.
 */
const SCREEN_LINK_CLASS =
  'fixed bottom-14 left-0 z-30 m-3 -translate-x-[calc(100%+2rem)] bg-black px-4 py-2 font-styled text-lg text-white outline outline-white focus:translate-x-0'

function SceneFallback() {
  return <div className="fixed inset-0 h-dvh w-full bg-black" />
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
