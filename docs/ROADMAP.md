# Roadmap

## Phase 1 — MVP (Classic Mode)

**Goal:** Playable daily game with Classic mode, deployed on Vercel.

### Milestone 1.1 — Data Pipeline
- [ ] Write `data/canon-arcs.json` (full list of canonical manga arcs)
- [ ] Build scraper: `scraper/main.py` with MediaWiki API integration
- [ ] Implement filler filter (skip characters not in canonical arcs)
- [ ] Generate initial `data/characters.json` (~150–200 characters)
- [ ] Validate schema against `DATA-SCHEMA.md` type definitions

### Milestone 1.2 — Game Logic
- [ ] TypeScript types in `src/types/character.ts`
- [ ] Daily seed logic in `src/lib/daily.ts`
- [ ] Attribute comparison logic in `src/lib/game.ts` (exact / partial / wrong)
- [ ] localStorage state management in `src/lib/storage.ts`

### Milestone 1.3 — UI
- [ ] Next.js project setup (App Router, Tailwind, shadcn/ui)
- [ ] Character search / autocomplete (`GuessInput.tsx`)
- [ ] Guess row with color-coded attribute cells (`GuessRow.tsx`, `AttributeCell.tsx`)
- [ ] Game board (`GameBoard.tsx`)
- [ ] Win/lose state (result modal with share button)
- [ ] Responsive layout (mobile-first)
- [ ] Dark mode support

### Milestone 1.4 — Deploy
- [ ] Configure Vercel project
- [ ] Set up custom domain (optional)
- [ ] Smoke test daily puzzle rotation

---

## Phase 2 — Additional Game Modes

**Goal:** Expand beyond Classic with new daily challenges.

### Quote Mode
- New route: `/quote`
- Add `quotes` field to `characters.json` (new scraper pass)
- Random daily quote from the character's dialogue
- Progressive reveal: show one extra hint word per wrong guess

### Jutsu Mode
- New route: `/jutsu`
- Add `signatureJutsu` field to `characters.json`
- Display jutsu name + description, player guesses the character

### Eye Mode
- New route: `/eye`
- Add `eyeImageUrl` field to `characters.json`
- Blurred/cropped eye image that sharpens with each wrong guess
- Image processing: sharp or Vercel image optimization

---

## Phase 3 — Internationalization

**Goal:** Support PT-BR and other locales.

- Integrate `next-intl`
- Extract all UI strings to `src/messages/en.json`
- Add `src/messages/pt-BR.json`
- Locale routing via Next.js i18n (`/en`, `/pt-BR`)
- Note: game attribute values (Alive, Deceased, etc.) remain in English

---

## Phase 4 — Statistics & Community

**Goal:** Aggregate stats and social features (requires backend).

- Global daily stats: distribution of guesses, solve rate
- Leaderboard (opt-in, anonymous)
- Backend options: Vercel Postgres, PlanetScale, or simple Redis
- API routes: `POST /api/result` to record results
- `GET /api/stats/[date]` to fetch aggregate stats

---

## Backlog / Nice-to-Have

- **Infinite mode** — unlimited random guesses (not daily)
- **Difficulty tiers** — hide some attributes to increase challenge
- **Achievements** — badges for streaks, speed, no-hint wins
- **Character images in guesses** — show portrait thumbnail in each row
- **Accessibility** — ARIA labels, keyboard navigation, color-blind friendly palette
- **PWA** — installable, offline support via service worker
- **Discord bot** — post daily puzzle to a server, collect guesses

---

## Release History

| Version | Date | Notes |
|---------|------|-------|
| 0.1.0 | TBD | MVP — Classic mode |
