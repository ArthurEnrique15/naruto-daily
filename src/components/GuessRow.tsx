import { GuessResult } from '@/types/game'
import AttributeCell from '@/components/AttributeCell'
import CharacterAvatar from '@/components/CharacterAvatar'

interface GuessRowProps {
  result: GuessResult
  isNew?: boolean
}

const ATTRIBUTES: { label: string; key: keyof Omit<GuessResult, 'character'> }[] = [
  { label: 'Affiliations', key: 'village' },
  { label: 'Gender', key: 'gender' },
  { label: 'Debut Arc', key: 'debutArc' },
  { label: 'Nature Types', key: 'natureTypes' },
  { label: 'Kekkei Genkai', key: 'kekkeiGenkai' },
  { label: 'Jutsu Types', key: 'jutsuTypes' },
]

export default function GuessRow({ result, isNew }: GuessRowProps) {
  return (
    <tr>
      <td className="p-1">
        <div
          className={`relative group flex items-center justify-center ${isNew ? 'animate-reveal' : ''}`}
          style={isNew ? { animationDelay: '0ms' } : undefined}
        >
          <CharacterAvatar imageUrl={result.character.imageUrl} name={result.character.name} className="w-20 h-20" />
          {/* Styled tooltip */}
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <div className="bg-popover text-popover-foreground text-xs font-semibold px-2 py-1 rounded shadow-lg border whitespace-nowrap">
              {result.character.name}
            </div>
          </div>
        </div>
      </td>
      {ATTRIBUTES.map(({ label, key }, index) => (
        <td
          key={key}
          className={`p-1 whitespace-nowrap ${isNew ? 'animate-reveal' : ''}`}
          style={isNew ? { animationDelay: `${(index + 1) * 200}ms` } : undefined}
        >
          <AttributeCell label={label} result={result[key]} />
        </td>
      ))}
    </tr>
  )
}
