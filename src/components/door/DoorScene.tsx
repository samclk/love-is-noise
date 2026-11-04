'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'

/**
 * The Canvas touches browser APIs on mount, and Next disallows `ssr: false`
 * inside a Server Component, so the dynamic import lives behind this boundary.
 */
const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 h-dvh w-full bg-black" />
})

/** Fades up from black once the scene has drawn. */
export function DoorScene() {
  const [shown, setShown] = React.useState(false)
  const show = React.useCallback(() => setShown(true), [])

  // A safety line: if the model never resolves, show the unfinished scene
  // rather than black forever.
  React.useEffect(() => {
    const timer = setTimeout(show, 8000)
    return () => clearTimeout(timer)
  }, [show])

  return (
    <>
      <Scene onReady={show} />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-10 bg-black transition-opacity duration-[2400ms] ease-out"
        style={{ opacity: shown ? 0 : 1 }}
      />
    </>
  )
}
