import { Character } from '@/types/character'
import { AttributeResult, Feedback, GuessResult } from '@/types/game'

function compareSet(guess: string[], target: string[]): Feedback {
  if (guess.length === 0 && target.length === 0) return 'correct'
  const gSorted = [...guess].sort()
  const tSorted = [...target].sort()
  if (JSON.stringify(gSorted) === JSON.stringify(tSorted)) return 'correct'
  const hasOverlap = guess.some((v) => target.includes(v))
  return hasOverlap ? 'partial' : 'wrong'
}

function compareExact(guess: string, target: string): Feedback {
  return guess.toLowerCase() === target.toLowerCase() ? 'correct' : 'wrong'
}

function setResult(guess: string[], target: string[]): AttributeResult {
  return { feedback: compareSet(guess, target), value: guess }
}

function exactResult(guess: string, target: string): AttributeResult {
  return { feedback: compareExact(guess, target), value: guess }
}

function arcResult(guess: string, target: string, arcNames: string[]): AttributeResult {
  const feedback = compareExact(guess, target)
  if (feedback === 'wrong') {
    const guessIdx = arcNames.indexOf(guess)
    const targetIdx = arcNames.indexOf(target)
    if (guessIdx !== -1 && targetIdx !== -1) {
      const direction: 'before' | 'after' = targetIdx < guessIdx ? 'before' : 'after'
      return { feedback, value: guess, direction }
    }
  }
  return { feedback, value: guess }
}

export function compareCharacters(guess: Character, target: Character, arcNames: string[] = []): GuessResult {
  return {
    character: guess,
    village: setResult(guess.village, target.village),
    gender: exactResult(guess.gender, target.gender),
    species: setResult(guess.species, target.species),
    rank: exactResult(guess.rank, target.rank),
    status: exactResult(guess.status, target.status),
    debutArc: arcResult(guess.debutArc, target.debutArc, arcNames),
    natureTypes: setResult(guess.natureTypes, target.natureTypes),
    kekkeiGenkai: setResult(guess.kekkeiGenkai, target.kekkeiGenkai),
    jutsuTypes: setResult(guess.jutsuTypes, target.jutsuTypes),
  }
}
