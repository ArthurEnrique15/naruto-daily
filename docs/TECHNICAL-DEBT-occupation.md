# Technical Debt: `occupation` Clue Field

## Status
Placeholder — not yet scraped.

## What exists

The `Character` interface in `src/types/character.ts` includes:

```ts
occupation?: string;
```

This field is **always `undefined`** for every character in the current dataset because it has not been added to the scraper or filter pipeline.

## What the UI does

`CluePanel` renders the occupation clue as:

```
🚧 Coming soon — occupation field not yet scraped
```

regardless of the actual field value (since it is always `undefined`).

## How to complete this

1. **Scraper** (`scraper/main.py`): Add extraction logic for the character's occupation from the Narutopedia infobox.
2. **Filter** (`scripts/filter-characters.ts`): Pass `occupation` through to the output JSON (no filtering needed — it's a plain string).
3. **Re-run pipeline**: `npm run build-data`
4. **Remove placeholder**: Update `CluePanel.tsx` — remove the `?? '🚧 Coming soon — occupation field not yet scraped'` fallback.
5. **Remove this file** once the field is live.
