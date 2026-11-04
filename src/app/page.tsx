import { DoorScene } from '@/components/door/DoorScene'

// The door scene, ahead of the riddle that will lead through it. The CRT gate
// that preceded it still lives in components/three and git history.
export default function Home() {
  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <DoorScene />
    </main>
  )
}
