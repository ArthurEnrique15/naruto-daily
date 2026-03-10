import { getAllCharacters } from '@/lib/characters'
import GameBoard from '@/components/GameBoard'

export default function Home() {
  const characters = getAllCharacters()
  const isDev = process.env.NODE_ENV === 'development'
  return (
    <main className="min-h-screen flex flex-col items-center gap-6 p-6">
      <h1 className="text-3xl font-bold">Naruto Daily</h1>
      <GameBoard characters={characters} isDev={isDev} />
    </main>
  )
}
