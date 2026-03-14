'use client'

import { Character } from '@/types/character'

interface ClueDef {
  key: string
  threshold: number
  label: string
  content: (target: Character) => string
}

const CLUES: ClueDef[] = [
  {
    key: 'rankSpecies',
    threshold: 4,
    label: 'Rank & Species',
    content: (t) => `${t.rank} · ${t.species.join(', ')}`,
  },
  {
    key: 'status',
    threshold: 6,
    label: 'Vital Status',
    content: (t) => t.status,
  },
  {
    key: 'occupation',
    threshold: 8,
    label: 'Occupation',
    content: (t) => t.occupation ?? '🚧 Coming soon — occupation field not yet scraped',
  },
]

interface CluePanelProps {
  missCount: number
  target: Character
  usedClues: string[]
  onReveal: (clueKey: string) => void
}

interface AvailableClueCardProps {
  label: string
  onReveal: () => void
}

function AvailableClueCard({ label, onReveal }: AvailableClueCardProps) {
  return (
    <div className="w-full max-w-md px-4 py-3 rounded-lg bg-muted border border-border flex items-center justify-between gap-4">
      <span className="text-muted-foreground text-sm">{label} hint available</span>
      <button
        onClick={onReveal}
        className="shrink-0 text-sm font-semibold px-3 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Reveal
      </button>
    </div>
  )
}

interface RevealedClueCardProps {
  label: string
  content: string
}

function RevealedClueCard({ label, content }: RevealedClueCardProps) {
  return (
    <div className="w-full max-w-md px-4 py-2 rounded-lg bg-muted border border-border text-center">
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-bold">{content}</span>
    </div>
  )
}

export default function CluePanel({ missCount, target, usedClues, onReveal }: CluePanelProps) {
  const visibleClues = CLUES.filter((c) => missCount >= c.threshold)

  if (visibleClues.length === 0) return null

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {visibleClues.map((clue) => {
        if (usedClues.includes(clue.key)) {
          return <RevealedClueCard key={clue.key} label={clue.label} content={clue.content(target)} />
        }
        return (
          <AvailableClueCard
            key={clue.key}
            label={clue.label}
            onReveal={() => onReveal(clue.key)}
          />
        )
      })}
    </div>
  )
}
