import { DoorScene } from '@/components/door/DoorScene'

// A door in the rain. Opening it leads to the riddle, and the riddle to the
// reveal. The CRT gate that preceded it is in git history.
export default function Home() {
  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <DoorScene />
    </main>
  )
}
