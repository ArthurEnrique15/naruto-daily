import { GuessResult } from '@/types/game'
import AttributeCell from '@/components/AttributeCell'

interface GuessRowProps {
  result: GuessResult
}

export default function GuessRow({ result }: GuessRowProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-bold w-32 shrink-0 text-sm">{result.character.name}</span>
      <AttributeCell label="Village" result={result.village} />
      <AttributeCell label="Gender" result={result.gender} />
      <AttributeCell label="Species" result={result.species} />
      <AttributeCell label="Rank" result={result.rank} />
      <AttributeCell label="Status" result={result.status} />
      <AttributeCell label="Debut Arc" result={result.debutArc} />
      <AttributeCell label="Nature Types" result={result.natureTypes} />
      <AttributeCell label="Kekkei Genkai" result={result.kekkeiGenkai} />
      <AttributeCell label="Jutsu Types" result={result.jutsuTypes} />
    </div>
  )
}
