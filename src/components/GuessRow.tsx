import { GuessResult } from '@/types/game'
import AttributeCell from '@/components/AttributeCell'

interface GuessRowProps {
  result: GuessResult
  isNew?: boolean
}

const ATTRIBUTES: { label: string; key: keyof Omit<GuessResult, 'character'> }[] = [
  { label: 'Village', key: 'village' },
  { label: 'Gender', key: 'gender' },
  { label: 'Species', key: 'species' },
  { label: 'Rank', key: 'rank' },
  { label: 'Status', key: 'status' },
  { label: 'Debut Arc', key: 'debutArc' },
  { label: 'Nature Types', key: 'natureTypes' },
  { label: 'Kekkei Genkai', key: 'kekkeiGenkai' },
  { label: 'Jutsu Types', key: 'jutsuTypes' },
]

export default function GuessRow({ result, isNew }: GuessRowProps) {
  return (
    <tr>
      <td className="p-1 whitespace-nowrap">
        <div
          className={`flex items-center gap-2 ${isNew ? 'animate-reveal' : ''}`}
          style={isNew ? { animationDelay: '0ms' } : undefined}
        >
          {result.character.imageUrl && (
            <img
              src={result.character.imageUrl}
              alt={result.character.name}
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          )}
          <span className="font-bold text-sm">{result.character.name}</span>
        </div>
      </td>
      {ATTRIBUTES.map(({ label, key }, index) => (
        <td
          key={key}
          className={`p-1 whitespace-nowrap ${isNew ? 'animate-reveal' : ''}`}
          style={isNew ? { animationDelay: `${(index + 1) * 120}ms` } : undefined}
        >
          <AttributeCell label={label} result={result[key]} />
        </td>
      ))}
    </tr>
  )
}
