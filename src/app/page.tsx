import { getAllCharacters } from '@/lib/characters'
import GameBoard from '@/components/GameBoard'

export default function Home() {
  const characters = getAllCharacters()
  const isDev = process.env.NODE_ENV === 'development'
  return (
    <main className="min-h-screen flex flex-col items-center gap-8 p-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-5xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Naruto Daily</h1>
        <p className="text-muted-foreground text-base">Guess today&apos;s Naruto character</p>
      </div>
      <GameBoard characters={characters} isDev={isDev} />
    </main>
  )
}
