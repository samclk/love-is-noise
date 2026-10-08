'use client'

import * as React from 'react'

/**
 * The part of the window an on-screen keyboard leaves visible, or null while
 * there is no keyboard up.
 *
 * Sizing the canvas to this re-centres the framing on what is left, so the
 * prompt is not typed into blind behind the keyboard. Pinch-zoom also shrinks
 * the visual viewport, which is why a zoomed viewport is ignored.
 */
export function useKeyboardInset() {
  const [visible, setVisible] = React.useState<{
    top: number
    height: number
  } | null>(null)

  React.useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const update = () => {
      const covered = window.innerHeight - viewport.height
      const next =
        viewport.scale === 1 && covered > KEYBOARD_MIN
          ? { top: viewport.offsetTop, height: viewport.height }
          : null
      // Every scroll event fires this; only a real change should resize the canvas.
      setVisible((current) =>
        current?.top === next?.top && current?.height === next?.height
          ? current
          : next
      )
    }

    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
    }
  }, [])

  return visible
}

/** Less than this is browser chrome settling, not a keyboard. */
const KEYBOARD_MIN = 150
