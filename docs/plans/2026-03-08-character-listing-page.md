# Character Listing Page — Implementation Plan

**Goal:** Bootstrap the Next.js app and build a simple paginated character listing page that displays all characters from `data/characters.json`.

**Architecture:** Next.js App Router with Server Components — character data is read from `data/characters.json` at render time (no client fetch). Pagination uses URL search params (`?page=1`). shadcn/ui provides Card and Button primitives.

**Tech Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS, shadcn/ui, Node `fs` for data loading.

---

## Preliminary Tasks

### Task 0: Update CLAUDE.md + create docs/plans directory
### Task 1: Initialize Next.js project
### Task 2: Install and initialize shadcn/ui
### Task 3: Create Character TypeScript type
### Task 4: Create character data loader
### Task 5: Create CharacterCard component
### Task 6: Create Pagination component
### Task 7: Create characters listing page
