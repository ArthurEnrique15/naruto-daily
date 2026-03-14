import Link from 'next/link'
import { getActiveCharacters } from '@/lib/characters'
import GameBoard from '@/components/GameBoard'

export default function Home() {
  const characters = getActiveCharacters()
  const isDev = process.env.NODE_ENV === 'development'
  return (
    <main className="min-h-screen flex flex-col items-center gap-8 p-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-5xl font-bold tracking-tight">Naruto Daily</h1>
        <p className="text-muted-foreground text-base">Guess today&apos;s Naruto character</p>
        <Link
          href="/characters"
          className="mt-2 px-4 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Characters
        </Link>
      </div>
      <GameBoard characters={characters} isDev={isDev} />
    </main>
  )
}
