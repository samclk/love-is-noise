import { HomeScene } from '@/components/three/HomeScene'

// The page is the puzzle and nothing else. The store, tour, video and social
// content that previously lived here is preserved in git history.
export default function Home() {
  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <HomeScene />
    </main>
  )
}
