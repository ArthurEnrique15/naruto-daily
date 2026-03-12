'use client'

import { useState, useEffect } from 'react'
import { Character } from '@/types/character'
import { GuessResult } from '@/types/game'
import { getDailyCharacter, getRandomCharacter, getTodayDateString } from '@/lib/daily'
import { compareCharacters } from '@/lib/game'
import { getArcNames } from '@/lib/arcs'
import { loadGameState, saveGameState, clearGameState } from '@/lib/storage'
import GuessInput from '@/components/GuessInput'
import GuessTable from '@/components/GuessTable'
import DevBanner from '@/components/DevBanner'

interface GameBoardProps {
  characters: Character[]
  isDev: boolean
}

const arcNames = getArcNames()

function restoreGuesses(characters: Character[], guessIds: string[]): GuessResult[] {
  const dailyTarget = getDailyCharacter(characters)
  return guessIds
    .map((id) => characters.find((c) => c.id === id))
    .filter((c): c is Character => c !== undefined)
    .map((c) => compareCharacters(c, dailyTarget, arcNames))
}

const DISPLAYED_ATTRS: (keyof Omit<GuessResult, 'character'>)[] = [
  'village', 'gender', 'species', 'rank', 'debutArc', 'natureTypes', 'kekkeiGenkai', 'jutsuTypes',
]

function allAttributesCorrect(result: GuessResult): boolean {
  return DISPLAYED_ATTRS.every((key) => result[key].feedback === 'correct')
}

export default function GameBoard({ characters, isDev }: GameBoardProps) {
  const [target, setTarget] = useState<Character>(() => getDailyCharacter(characters))
  const [guesses, setGuesses] = useState<GuessResult[]>([])
  const [solved, setSolved] = useState<boolean>(false)
  const [sameAttributesWarning, setSameAttributesWarning] = useState(false)

  useEffect(() => {
    const state = loadGameState()
    if (state) {
      setGuesses(restoreGuesses(characters, state.guessIds))
      setSolved(state.solved ?? false)
    }
  }, [])

  function handleGuess(char: Character) {
    setSameAttributesWarning(false)
    const result = compareCharacters(char, target, arcNames)
    const newGuesses = [...guesses, result]
    const nowSolved = char.id === target.id
    if (!nowSolved && allAttributesCorrect(result)) {
      setSameAttributesWarning(true)
    }
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
    <div className="flex flex-col items-center gap-6 w-full max-w-7xl">
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
      {guesses.length >= 5 && !solved && (
        <div className="w-full max-w-md px-4 py-2 rounded-lg bg-muted border border-border text-center">
          <span className="text-muted-foreground">Vital Status Clue: </span>
          <span className="font-bold">{target.status}</span>
        </div>
      )}
      {sameAttributesWarning && (
        <div className="w-full max-w-md px-4 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 text-center text-sm">
          This character has the exact same attributes as today&apos;s answer — but they&apos;re not the same person!
        </div>
      )}
      <div className="w-full bg-card border border-border rounded-xl shadow-sm p-6 flex flex-col gap-6">
        <GuessInput
          characters={characters}
          guessedIds={guessedIds}
          onGuess={handleGuess}
          disabled={solved}
        />
        {guesses.length > 0 && (
          <GuessTable guesses={guesses.slice().reverse()} />
        )}
      </div>
    </div>
  )
}
