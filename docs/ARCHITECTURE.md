# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Data Pipeline                        │
│                                                         │
│  Narutopedia        scraper/         data/              │
│  (MediaWiki API) ──► main.py ───────► characters.json   │
│                       │               canon-arcs.json   │
│                       │ (filler filter)                 │
└───────────────────────┼─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js Application                    │
│                                                         │
│  data/characters.json                                   │
│         │                                               │
│         ▼ (build time — RSC / generateStaticParams)     │
│  src/lib/daily.ts ─── daily character selection         │
│  src/lib/game.ts  ─── attribute comparison              │
│  src/lib/storage.ts ─ localStorage (state persistence)  │
│         │                                               │
│         ▼                                               │
│  src/components/ ─── React UI (shadcn/ui + Tailwind)    │
│  src/app/        ─── Next.js App Router pages           │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
              Vercel (static + edge)
```

## Project Structure

```
naruto-daily/
├── CLAUDE.md                    # Claude Code context
├── README.md                    # Project overview
├── docs/                        # Planning and architecture docs
├── data/
│   ├── characters.json          # All playable characters (scraper output)
│   └── canon-arcs.json          # Whitelist of canonical manga arcs
├── scraper/
│   ├── main.py                  # Entry point
│   ├── requirements.txt
│   └── README.md
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Main game page
│   │   └── globals.css
│   ├── components/
│   │   ├── GameBoard.tsx        # Main game container
│   │   ├── GuessInput.tsx       # Character search/autocomplete
│   │   ├── GuessRow.tsx         # Single guess row with feedback
│   │   ├── AttributeCell.tsx    # Individual attribute cell (color-coded)
│   │   └── ShareButton.tsx      # Copy emoji grid to clipboard
│   ├── lib/
│   │   ├── daily.ts             # Deterministic daily seed
│   │   ├── game.ts              # Comparison logic (exact/partial/wrong)
│   │   └── storage.ts           # localStorage helpers (guesses, streak)
│   └── types/
│       └── character.ts         # Character type definitions
├── public/
├── package.json
├── tsconfig.json
└── next.config.ts
```

## UI Stack

### Tailwind CSS
- Utility-first styling
- Dark mode via `dark:` prefix
- No custom CSS except `globals.css` for Tailwind base

### shadcn/ui Components Used
| Component | Usage |
|-----------|-------|
| `Input` | Character search field |
| `Button` | Submit guess, Share |
| `Badge` | Attribute tags in cells |
| `Dialog` | How-to-play modal, result modal |
| `Command` | Autocomplete dropdown for character search |
| `Tooltip` | Attribute label on hover |

## Daily Puzzle Logic

```typescript
// src/lib/daily.ts
const EPOCH = new Date('2025-01-01').getTime()

export function getDailyCharacter(characters: Character[]): Character {
  const daysSinceEpoch = Math.floor((Date.now() - EPOCH) / 86_400_000)
  const index = daysSinceEpoch % characters.length
  return characters[index]
}
```

- Deterministic: same character for all players on the same calendar day
- No backend required
- Rotates through the full character list before repeating

## Data at Build Time

Characters are loaded at build time using React Server Components:

```typescript
// src/app/page.tsx (Server Component)
import characters from '@/data/characters.json'
```

- Zero client-side data fetching for the character list
- Autocomplete list is bundled at build time
- Keeps the client bundle lean — only game state is dynamic

## Filler Filter

1. `data/canon-arcs.json` contains a manually curated list of canonical manga arcs
2. The scraper compares each character's debut arc against this whitelist
3. Characters whose **only** appearances are in non-canonical arcs are excluded
4. The filter runs at scrape time — `characters.json` never contains filler-only characters

## i18n Strategy (Future)

- Using `next-intl` (not yet implemented in MVP)
- All user-facing strings extracted to `src/messages/en.json`
- Game logic and data remain English-only (attribute values are not translated)
- Adding a new locale = adding `src/messages/{locale}.json`

## Extensibility: Adding New Game Modes

Each mode is an independent module:
1. Add a new route: `src/app/[mode]/page.tsx`
2. Add mode-specific logic in `src/lib/{mode}.ts`
3. Characters JSON may need new fields (add to schema, re-scrape)
4. Modes share the same daily seed mechanism

Planned modes: Classic (MVP), Quote, Jutsu, Eye (see `ROADMAP.md`)
