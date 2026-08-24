'use client'

import * as React from 'react'

/**
 * True only while the scene is worth rendering: on screen, and in a tab the
 * viewer is actually looking at.
 *
 * A WebGL scene with a post-processing stack will happily cook a laptop
 * rendering to a canvas nobody can see, so the frame loop is stopped outright
 * rather than throttled.
 */
export function useSceneActive(ref: React.RefObject<HTMLElement | null>) {
  const [onScreen, setOnScreen] = React.useState(true)
  const [tabVisible, setTabVisible] = React.useState(true)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry?.isIntersecting ?? true),
      { rootMargin: '100px' }
    )
    observer.observe(element)

    return () => observer.disconnect()
  }, [ref])

  React.useEffect(() => {
    const onVisibilityChange = () =>
      setTabVisible(document.visibilityState === 'visible')

    onVisibilityChange()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return onScreen && tabVisible
}
