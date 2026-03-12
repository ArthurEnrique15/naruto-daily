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

  const rawStr = Array.isArray(result.value)
    ? result.value.join(', ')
    : (result.value ?? '')
  const isLongContent =
    rawStr.length > 35 || (Array.isArray(result.value) && result.value.length >= 3)

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
                className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white ${icon.className}`}
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
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
    const arrowChar = result.direction === 'before' ? '↓' : '↑'
    const raw = Array.isArray(result.value)
      ? result.value.length > 0 ? result.value.join(', ') : '—'
      : result.value || '—'
    displayValue = (
      <div className="relative flex items-center justify-center w-full">
        <span className="absolute text-8xl font-black select-none opacity-90 text-red-950">{arrowChar}</span>
        <span className="relative text-xs font-bold text-center leading-tight break-words w-full">{raw}</span>
      </div>
    )
  } else {
    displayValue = Array.isArray(result.value)
      ? result.value.length > 0 ? result.value.join(', ') : '—'
      : result.value || '—'
  }

  return (
    <div className={`flex flex-col items-center justify-center w-full h-20 overflow-hidden rounded p-2 whitespace-normal ${feedbackColors[result.feedback]}`}>
      <span
        className={`${isLongContent ? 'text-xs' : 'text-sm'} font-semibold text-center leading-tight break-words w-full`}
      >
        {displayValue}
      </span>
    </div>
  )
}
