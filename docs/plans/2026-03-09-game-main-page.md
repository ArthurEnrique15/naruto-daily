# Game Main Page — Implementation Plan

**Date:** 2026-03-09
**Branch:** `feat/game-main-page`
**Status:** Ready for implementation

---

## Context

The Naruto Daily codebase has types, data loading, and a character gallery, but no actual game. The home page is a bare landing page. This plan covers implementing the full game board on the home page.

---

## Architecture

`src/app/page.tsx` (server component) loads all characters and passes them to `<GameBoard>` (client component). `process.env.NODE_ENV` is forwarded as `isDev` prop to control dev banner visibility. No API routes needed — seed is deterministic client-side.

```
page.tsx (Server)
  └─ getAllCharacters() from src/lib/characters.ts
  └─ <GameBoard characters={[...]} isDev={bool} />
        ├─ daily.ts (seed / random)
        ├─ game.ts (comparison logic)
        ├─ storage.ts (localStorage)
        ├─ <DevBanner />        — dev only
        ├─ <GuessInput />       — autocomplete
        └─ <GuessRow /> × n     — newest first
              └─ <AttributeCell /> × 9
```

---

## Files to Create

### `src/types/game.ts`

```typescript
export type Feedback = 'correct' | 'partial' | 'wrong'

export interface AttributeResult {
  feedback: Feedback
  value: string | string[]   // guessed character's value (for display)
}

export interface GuessResult {
  character: Character
  village: AttributeResult
  gender: AttributeResult
  species: AttributeResult
  rank: AttributeResult
  status: AttributeResult
  debutArc: AttributeResult
  natureTypes: AttributeResult
  kekkeiGenkai: AttributeResult
  jutsuTypes: AttributeResult
}
```

Import `Character` from `@/types/character`.

---

### `src/lib/daily.ts`

- `getDailyCharacter(characters: Character[]): Character`
  - epoch = `2025-01-01T00:00:00Z`
  - `daysSinceEpoch = Math.floor((Date.now() - epoch) / 86_400_000)`
  - return `characters[daysSinceEpoch % characters.length]`
- `getPuzzleNumber(characters: Character[]): number`
  - same formula, return `daysSinceEpoch % characters.length + 1`
- `getRandomCharacter(characters: Character[]): Character`
  - `characters[Math.floor(Math.random() * characters.length)]`
- `getTodayDateString(): string`
  - returns `'YYYY-MM-DD'` in UTC (use `new Date().toISOString().slice(0, 10)`)

---

### `src/lib/game.ts`

Single export: `compareCharacters(guess: Character, target: Character): GuessResult`

**Set attributes** — village, species, kekkeiGenkai, natureTypes, jutsuTypes (all `string[]`):
- `correct` = arrays are identical (same elements; compare sorted copies)
- `partial` = at least one element in common (but not identical)
- `wrong` = no elements in common, or both arrays are empty → `wrong`

**Exact attributes** — rank, gender, status, debutArc (all `string`):
- `correct` = values match (case-insensitive)
- `wrong` = values differ

Each `AttributeResult.value` = the **guess character's** value (not the target's).

---

### `src/lib/storage.ts`

```typescript
interface GameState {
  date: string        // 'YYYY-MM-DD' UTC
  guessIds: string[]  // character ids in order (oldest first)
  solved: boolean
}
```

- `loadGameState(): GameState | null`
  - Returns `null` if no data stored, or if stored `date` differs from today (stale)
- `saveGameState(state: GameState): void`
- `clearGameState(): void`
- Key: `nd_game_state` (prefix `nd_` per GAME-MECHANICS.md)

---

### `src/components/AttributeCell.tsx`

Props:
```typescript
interface AttributeCellProps {
  label: string
  result: AttributeResult
}
```

Behaviour:
- Background color based on `result.feedback`:
  - `correct` → `bg-green-600`
  - `partial` → `bg-yellow-500`
  - `wrong` → `bg-gray-500`
- Displays: `label` (small, muted text above) + value(s) (array joined with `, `; show `—` if empty array or empty string)
- Fixed width (e.g. `w-28`) so all rows align

---

### `src/components/GuessRow.tsx`

Props:
```typescript
interface GuessRowProps {
  result: GuessResult
}
```

Behaviour:
- Shows character name on the left (bold)
- Renders 9 `<AttributeCell>` in this display order:
  1. Village
  2. Gender
  3. Species
  4. Rank
  5. Status
  6. Debut Arc
  7. Nature Types
  8. Kekkei Genkai
  9. Jutsu Types

---

### `src/components/GuessInput.tsx`

`'use client'`

Props:
```typescript
interface GuessInputProps {
  characters: Character[]
  guessedIds: Set<string>
  onGuess: (character: Character) => void
  disabled: boolean
}
```

Behaviour:
- Controlled text input
- Filters characters by name (case-insensitive substring match), max 8 results in dropdown
- Already-guessed characters appear with strikethrough + dimmed in dropdown; clicking them does nothing
- Clears input after a successful guess
- Submits on click or Enter key
- Shows no dropdown when input is empty

---

### `src/components/DevBanner.tsx`

Props:
```typescript
interface DevBannerProps {
  currentCharacter: Character
  onNewCharacter: () => void
  onReset: () => void
}
```

Behaviour:
- Yellow banner (e.g. `bg-yellow-300 text-black`)
- Content: `[DEV] Current: {name} | 🎲 New Character | ↺ Reset Guesses`
- `onNewCharacter` → pick a random character + clear guesses
- `onReset` → keep same character, clear guesses only

---

### `src/components/GameBoard.tsx`

`'use client'`

Props:
```typescript
interface GameBoardProps {
  characters: Character[]
  isDev: boolean
}
```

State:
- `target: Character` — daily character (or random in dev)
- `guesses: GuessResult[]`
- `solved: boolean`

On mount (`useEffect`):
1. Call `loadGameState()`
2. If state exists and date matches today: restore `target` from `characters` by id, restore `guesses` by re-running `compareCharacters` for each stored id, restore `solved`
3. Otherwise: start fresh with `getDailyCharacter(characters)`

`handleGuess(char: Character)`:
1. `compareCharacters(char, target)` → push result to `guesses`
2. Check if `char.id === target.id` → set `solved = true`
3. Save to storage

Renders (top to bottom):
1. `<DevBanner>` if `isDev`
2. Win message if `solved`: `"You got it in {n} guess{es}!"` (pluralized)
3. `<GuessInput disabled={solved} ...>`
4. `{guesses.slice().reverse().map(<GuessRow>)}` — newest first

---

## Files to Modify

### `src/app/page.tsx`

Replace the current landing page content with:

```tsx
import { getAllCharacters } from '@/lib/characters'
import GameBoard from '@/components/GameBoard'

export default async function Home() {
  const characters = await getAllCharacters()
  const isDev = process.env.NODE_ENV === 'development'
  return (
    <main className="min-h-screen flex flex-col items-center gap-6 p-6">
      <h1 className="text-3xl font-bold">Naruto Daily</h1>
      <GameBoard characters={characters} isDev={isDev} />
    </main>
  )
}
```

---

## Implementation Order

Implement in this order to avoid import errors at each step:

1. `src/types/game.ts`
2. `src/lib/daily.ts`
3. `src/lib/game.ts`
4. `src/lib/storage.ts`
5. `src/components/AttributeCell.tsx`
6. `src/components/GuessRow.tsx`
7. `src/components/GuessInput.tsx`
8. `src/components/DevBanner.tsx`
9. `src/components/GameBoard.tsx`
10. `src/app/page.tsx` (modify)

---

## Verification Steps

After implementation:

1. `npm run type-check` — must pass with 0 errors
2. `npm run lint` — must pass with 0 errors
3. `npm run build` — must succeed
4. `npm run dev` — manual check:
   - Home page renders without crashing
   - Typing a name in the input shows filtered dropdown
   - Guessing a character shows a `<GuessRow>` with colored cells
   - Guessing the correct character shows the win message
   - Refreshing the page restores previous guesses (localStorage)
   - In dev mode: yellow banner is visible, random / reset buttons work
   - In production build: dev banner is not rendered
