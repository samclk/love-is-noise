'use client'

import * as React from 'react'

export type ScreenClip = {
  /** Null until the element mounts, which is one render behind everything else. */
  element: HTMLVideoElement | null
  /** Ref callback for the element itself. */
  attach: (node: HTMLVideoElement | null) => void
  playing: boolean
  toggle: () => void
}

type ScreenClipOptions = {
  /** Whether the scene has been revealed, so the clip may start. */
  start: boolean
  /** False under reduced motion: the clip waits for the button instead. */
  autoplay: boolean
}

/**
 * Owns the clip's playback so a real control outside the canvas can drive it.
 *
 * A tube that is not playing is a dark tube — ScreenVideo hides the picture
 * outright rather than leaving a frame on the glass. So there is no poster and
 * no still: the clip either runs or the screen is off.
 *
 * The element is tracked as state rather than a ref because the scene has to
 * re-render once it exists: a texture cannot be built from a ref that was still
 * null when the tree first rendered.
 */
export function useScreenClip({
  start,
  autoplay
}: ScreenClipOptions): ScreenClip {
  const [element, setElement] = React.useState<HTMLVideoElement | null>(null)
  const [playing, setPlaying] = React.useState(false)
  const started = React.useRef(false)

  React.useEffect(() => {
    if (!element) return

    // Tracked from the element's own events, not from what we asked it to do.
    // play() is a promise the browser is free to refuse, and the button has to
    // show what is actually happening.
    const sync = () => setPlaying(!element.paused)
    element.addEventListener('play', sync)
    element.addEventListener('pause', sync)
    sync()

    return () => {
      element.removeEventListener('play', sync)
      element.removeEventListener('pause', sync)
    }
  }, [element])

  React.useEffect(() => {
    if (!element || !start || !autoplay || started.current) return
    started.current = true
    // Muted playback needs no gesture, but a browser may still refuse it — iOS
    // in low power mode does. That is not an error worth surfacing; the tube
    // just stays dark until someone presses the button.
    element.play().catch(() => {})
  }, [element, start, autoplay])

  const toggle = React.useCallback(() => {
    if (!element) return
    if (element.paused) element.play().catch(() => {})
    else element.pause()
  }, [element])

  return { element, attach: setElement, playing, toggle }
}
