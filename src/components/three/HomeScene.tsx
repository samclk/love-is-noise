'use client'

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

export function HomeScene() {
  return (
    <>
      <Scene />
      <SceneProgress />
    </>
  )
}

function SceneFallback() {
  return <div className="fixed inset-0 h-screen w-full bg-black" />
}

/** The model is the entire hero, so there is nothing else to look at while it loads. */
function SceneProgress() {
  const { active, progress } = useProgress()

  if (!active) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex items-end justify-center pb-16">
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
