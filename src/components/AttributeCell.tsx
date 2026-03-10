import { AttributeResult } from '@/types/game'
import { getNatureIcon } from '@/lib/nature-icons'

interface AttributeCellProps {
  label: string
  result: AttributeResult
}

const feedbackColors = {
  correct: 'bg-green-600 text-white',
  partial: 'bg-yellow-500 text-black',
  wrong: 'bg-red-600 text-white',
}

export default function AttributeCell({ label, result }: AttributeCellProps) {
  const isNatureTypes = label === 'Nature Types' && Array.isArray(result.value)
  const isDebutArc = label === 'Debut Arc'

  let displayValue: React.ReactNode

  if (isNatureTypes && Array.isArray(result.value)) {
    if (result.value.length === 0) {
      displayValue = '—'
    } else {
      displayValue = (
        <span className="flex flex-wrap gap-1 justify-center">
          {result.value.map((nature) => {
            const icon = getNatureIcon(nature)
            return (
              <span
                key={nature}
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${icon.className}`}
                title={nature}
              >
                {icon.symbol}
              </span>
            )
          })}
        </span>
      )
    }
  } else if (isDebutArc && result.feedback === 'wrong' && result.direction) {
    const arrow = result.direction === 'before' ? ' ↑' : ' ↓'
    const raw = Array.isArray(result.value)
      ? result.value.length > 0 ? result.value.join(', ') : '—'
      : result.value || '—'
    displayValue = raw + arrow
  } else {
    displayValue = Array.isArray(result.value)
      ? result.value.length > 0 ? result.value.join(', ') : '—'
      : result.value || '—'
  }

  return (
    <div className={`flex flex-col items-center justify-center w-28 h-16 rounded p-1 ${feedbackColors[result.feedback]}`}>
      <span className="text-[10px] uppercase tracking-wide opacity-75">{label}</span>
      <span className="text-xs font-semibold text-center leading-tight">{displayValue}</span>
    </div>
  )
}
