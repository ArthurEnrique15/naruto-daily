import { Character } from '@/types/character'
import { AttributeResult, Feedback, GuessResult } from '@/types/game'

function compareSet(guess: string[], target: string[]): Feedback {
  if (guess.length === 0 && target.length === 0) return 'wrong'
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

export function compareCharacters(guess: Character, target: Character): GuessResult {
  return {
    character: guess,
    village: setResult(guess.village, target.village),
    gender: exactResult(guess.gender, target.gender),
    species: setResult(guess.species, target.species),
    rank: exactResult(guess.rank, target.rank),
    status: exactResult(guess.status, target.status),
    debutArc: exactResult(guess.debutArc, target.debutArc),
    natureTypes: setResult(guess.natureTypes, target.natureTypes),
    kekkeiGenkai: setResult(guess.kekkeiGenkai, target.kekkeiGenkai),
    jutsuTypes: setResult(guess.jutsuTypes, target.jutsuTypes),
  }
}
