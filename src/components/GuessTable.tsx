import { GuessResult } from '@/types/game'
import GuessRow from '@/components/GuessRow'

interface GuessTableProps {
  guesses: GuessResult[]
}

export default function GuessTable({ guesses }: GuessTableProps) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="table-fixed border-separate border-spacing-1 mx-auto">
        <thead className="sticky top-0 z-10 bg-background">
          <tr>
            <th className="w-24 text-sm font-semibold text-left px-1 pb-1">Character</th>
            <th className="w-28 text-sm font-semibold px-1 pb-1">Village</th>
            <th className="w-28 text-sm font-semibold px-1 pb-1">Gender</th>
            <th className="w-28 text-sm font-semibold px-1 pb-1">Species</th>
            <th className="w-28 text-sm font-semibold px-1 pb-1">Rank</th>
            <th className="w-28 text-sm font-semibold px-1 pb-1">Status</th>
            <th className="w-32 text-sm font-semibold px-1 pb-1">Debut Arc</th>
            <th className="w-40 text-sm font-semibold px-1 pb-1">Nature Types</th>
            <th className="w-28 text-sm font-semibold px-1 pb-1">Kekkei Genkai</th>
            <th className="w-28 text-sm font-semibold px-1 pb-1">Jutsu Types</th>
          </tr>
        </thead>
        <tbody className="font-semibold">
          {guesses.map((result, i) => (
            <GuessRow key={`${result.character.id}-${i}`} result={result} isNew={i === 0} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
