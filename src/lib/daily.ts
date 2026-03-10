import { Character } from '@/types/character'

const EPOCH = new Date('2025-01-01T00:00:00Z').getTime()

function daysSinceEpoch(): number {
  return Math.floor((Date.now() - EPOCH) / 86_400_000)
}

export function getDailyCharacter(characters: Character[]): Character {
  return characters[daysSinceEpoch() % characters.length]
}

export function getPuzzleNumber(characters: Character[]): number {
  return (daysSinceEpoch() % characters.length) + 1
}

export function getRandomCharacter(characters: Character[]): Character {
  return characters[Math.floor(Math.random() * characters.length)]
}

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}
