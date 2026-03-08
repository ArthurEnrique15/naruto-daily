# Game Mechanics

## Classic Mode

### Objective

Guess the daily Naruto character. After each guess, receive color-coded feedback on each attribute
to narrow down the correct character.

### Flow

1. Player types a character name in the search input
2. Autocomplete shows matching characters from the full roster
3. Player selects a character and submits
4. A new guess row appears with color-coded feedback for each attribute
5. Repeat until correct or player gives up (no guess limit)

### Attribute Comparison Rules

| Attribute | Comparison Type | Feedback Logic |
|-----------|----------------|----------------|
| `village` | Set / Partial | Green if exact same set; Yellow if any overlap; Gray if no overlap |
| `rank` | Exact | Green if identical; Gray otherwise |
| `kekkeiGenkai` | Set / Partial | Green if exact same set; Yellow if any overlap; Gray if no overlap |
| `natureTypes` | Set / Partial | Green if exact same set; Yellow if any overlap; Gray if no overlap |
| `jutsuTypes` | Set / Partial | Green if exact same set; Yellow if any overlap; Gray if no overlap |
| `status` | Exact | Green if identical; Gray otherwise |
| `debutArc` | Exact | Green if identical; Gray otherwise |
| `gender` | Exact | Green if identical; Gray otherwise |
| `species` | Set / Partial | Green if exact same set; Yellow if any overlap; Gray if no overlap |

### Feedback Color System

| Color | Meaning | Display |
|-------|---------|---------|
| Green | Correct — attribute matches exactly | `bg-green-600` |
| Yellow | Partial — some overlap (for set attributes) | `bg-yellow-500` |
| Gray | Wrong — no match | `bg-gray-500` |

### Win Condition

All 9 attribute cells in a guess row are green.

### No Guess Limit

There is no maximum number of guesses in the MVP. Players can keep guessing until correct.
(Configurable in future via `NEXT_PUBLIC_MAX_GUESSES` env var.)

## Daily Puzzle System

### Seed Calculation

```typescript
// src/lib/daily.ts
const EPOCH = new Date('2025-01-01T00:00:00Z').getTime()

export function getDailyIndex(totalCharacters: number): number {
  const now = Date.now()
  const daysSinceEpoch = Math.floor((now - EPOCH) / 86_400_000)
  return daysSinceEpoch % totalCharacters
}

export function getDailyCharacter(characters: Character[]): Character {
  return characters[getDailyIndex(characters.length)]
}
```

- Resets at **00:00 UTC** each day
- Same character for all players worldwide on the same UTC date
- Cycles through the full roster before repeating

## State Persistence (localStorage)

### Keys

| Key | Type | Description |
|-----|------|-------------|
| `nd_daily_date` | `string` | ISO date of current puzzle (e.g. `"2025-03-08"`) |
| `nd_guesses` | `string[]` | Array of character IDs guessed today |
| `nd_solved` | `boolean` | Whether today's puzzle is solved |
| `nd_streak` | `number` | Current consecutive days solved |
| `nd_max_streak` | `number` | All-time best streak |
| `nd_total_wins` | `number` | Total puzzles solved |
| `nd_total_played` | `number` | Total puzzles played |

### State Reset

When `nd_daily_date` differs from today's UTC date, the daily state is reset:
- `nd_guesses` → `[]`
- `nd_solved` → `false`
- `nd_daily_date` → today
- Streak, wins, played counts are preserved

### Implementation

```typescript
// src/lib/storage.ts

export interface DailyState {
  date: string
  guesses: string[]     // character IDs
  solved: boolean
}

export interface StatsState {
  streak: number
  maxStreak: number
  totalWins: number
  totalPlayed: number
}

export function getDailyState(): DailyState { ... }
export function saveDailyState(state: DailyState): void { ... }
export function getStats(): StatsState { ... }
export function updateStats(solved: boolean): void { ... }
```

## Result Sharing

Players can share their result as an emoji grid:

```
Naruto Daily #42 — 5 guesses

🟩🟨🟩🟩🟨🟨🟩🟩🟩
🟩🟩🟩🟩🟨🟨🟩🟩🟩
🟩🟩🟩🟩🟩🟨🟩🟩🟩
🟩🟩🟩🟩🟩🟩🟩🟨🟩
🟩🟩🟩🟩🟩🟩🟩🟩🟩

narutodaily.vercel.app
```

- Emoji mapping: 🟩 = green, 🟨 = yellow, ⬜ = gray
- Copied to clipboard via `navigator.clipboard.writeText()`
- Column order matches the attribute display order

## Attribute Display Order

Attributes are always displayed in this fixed order (left to right):

1. Village / Affiliation
2. Gender
3. Species
4. Rank
5. Status
6. Debut Arc
7. Nature Types
8. Kekkei Genkai
9. Jutsu Types

## Future Modes

### Quote Mode
- Display a quote from a character
- Player guesses who said it
- Reveal one additional hint word at a time

### Jutsu Mode
- Display a jutsu name and description
- Player guesses which character's signature jutsu it is

### Eye Mode
- Display a close-up of a character's eyes
- Player guesses the character from the visual
- Gradually reveal more of the image with each wrong guess

See `ROADMAP.md` for implementation timeline.
