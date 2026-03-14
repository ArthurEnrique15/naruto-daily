import { getTodayDateString } from '@/lib/daily'

export interface GameState {
  date: string
  guessIds: string[]
  solved: boolean
  usedClues?: string[]
}

const KEY = 'nd_game_state'

export function loadGameState(): GameState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const state = JSON.parse(raw) as GameState
    if (state.date !== getTodayDateString()) return null
    return state
  } catch {
    return null
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function clearGameState(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}
