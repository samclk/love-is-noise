import { HomeScene } from '@/components/three/HomeScene'

// Scene only for now. The store, tour, video and social content that previously
// lived here is preserved in git history and gets composed back around the
// canvas in a following pass.
export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden">
      <HomeScene />
    </main>
  )
}
