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
    content: (t) => t.occupation ?? 'Unknown',
  },
]

interface CluePanelProps {
  missCount: number
  target: Character
  usedClues: string[]
  onReveal: (clueKey: string) => void
}

interface ClueCardProps {
  label: string
  missCount: number
  threshold: number
  revealed: boolean
  content: string
  onReveal: () => void
}

function ClueCard({ label, missCount, threshold, revealed, content, onReveal }: ClueCardProps) {
  const unlocked = missCount >= threshold
  const remaining = threshold - missCount

  if (revealed) {
    return (
      <div className="w-full max-w-md px-4 py-2 rounded-lg bg-muted border border-border text-center">
        <span className="text-muted-foreground">{label}: </span>
        <span className="font-bold">{content}</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md px-4 py-3 rounded-lg bg-muted border border-border flex items-center justify-between gap-4">
      <span className="text-muted-foreground text-sm">
        {unlocked ? `${label} hint available` : `${label} available in ${remaining} guess${remaining === 1 ? '' : 'es'}`}
      </span>
      <button
        onClick={onReveal}
        disabled={!unlocked}
        className="shrink-0 text-sm font-semibold px-3 py-1 rounded-md bg-primary text-primary-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-primary/90"
      >
        Reveal
      </button>
    </div>
  )
}

export default function CluePanel({ missCount, target, usedClues, onReveal }: CluePanelProps) {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {CLUES.map((clue) => (
        <ClueCard
          key={clue.key}
          label={clue.label}
          missCount={missCount}
          threshold={clue.threshold}
          revealed={usedClues.includes(clue.key)}
          content={clue.content(target)}
          onReveal={() => onReveal(clue.key)}
        />
      ))}
    </div>
  )
}
