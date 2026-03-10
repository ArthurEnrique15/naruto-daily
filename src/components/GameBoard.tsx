'use client'

import { useState } from 'react'
import { Character } from '@/types/character'
import { GuessResult } from '@/types/game'
import { getDailyCharacter, getRandomCharacter, getTodayDateString } from '@/lib/daily'
import { compareCharacters } from '@/lib/game'
import { loadGameState, saveGameState, clearGameState } from '@/lib/storage'
import GuessInput from '@/components/GuessInput'
import GuessRow from '@/components/GuessRow'
import DevBanner from '@/components/DevBanner'

interface GameBoardProps {
  characters: Character[]
  isDev: boolean
}

function restoreGuesses(characters: Character[], guessIds: string[]): GuessResult[] {
  const dailyTarget = getDailyCharacter(characters)
  return guessIds
    .map((id) => characters.find((c) => c.id === id))
    .filter((c): c is Character => c !== undefined)
    .map((c) => compareCharacters(c, dailyTarget))
}

export default function GameBoard({ characters, isDev }: GameBoardProps) {
  const [target, setTarget] = useState<Character>(() => getDailyCharacter(characters))
  const [guesses, setGuesses] = useState<GuessResult[]>(() => {
    const state = loadGameState()
    if (!state) return []
    return restoreGuesses(characters, state.guessIds)
  })
  const [solved, setSolved] = useState<boolean>(() => loadGameState()?.solved ?? false)

  function handleGuess(char: Character) {
    const result = compareCharacters(char, target)
    const newGuesses = [...guesses, result]
    const nowSolved = char.id === target.id
    setGuesses(newGuesses)
    setSolved(nowSolved)
    saveGameState({
      date: getTodayDateString(),
      guessIds: newGuesses.map((g) => g.character.id),
      solved: nowSolved,
    })
  }

  function handleNewCharacter() {
    const next = getRandomCharacter(characters)
    setTarget(next)
    setGuesses([])
    setSolved(false)
    clearGameState()
  }

  function handleReset() {
    setGuesses([])
    setSolved(false)
    clearGameState()
  }

  const guessedIds = new Set(guesses.map((g) => g.character.id))
  const guessCount = guesses.length
  const plural = guessCount === 1 ? '' : 'es'

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-4xl">
      {isDev && (
        <DevBanner
          currentCharacter={target}
          onNewCharacter={handleNewCharacter}
          onReset={handleReset}
        />
      )}
      {solved && (
        <p className="text-green-600 font-bold text-lg">
          You got it in {guessCount} guess{plural}!
        </p>
      )}
      <GuessInput
        characters={characters}
        guessedIds={guessedIds}
        onGuess={handleGuess}
        disabled={solved}
      />
      <div className="flex flex-col gap-2 w-full overflow-x-auto">
        {guesses.slice().reverse().map((result, i) => (
          <GuessRow key={`${result.character.id}-${i}`} result={result} />
        ))}
      </div>
    </div>
  )
}
