import Image from 'next/image'
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
  const isJutsuTypes = label === 'Jutsu Types' && Array.isArray(result.value)
  const isLongJutsuList = isJutsuTypes && result.value.length >= 4

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
                className={`relative group/nature inline-flex items-center justify-center w-6 h-6 ${icon.className}`}
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              >
                {icon.imagePath ? (
                  <Image
                    src={icon.imagePath}
                    alt={nature}
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-white">{nature[0]}</span>
                )}
                <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-50 pointer-events-none opacity-0 group-hover/nature:opacity-100 transition-opacity duration-75 bg-popover text-popover-foreground text-xs font-semibold px-2 py-1 rounded shadow-lg border whitespace-nowrap">
                  {nature}
                </span>
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
      <div className="flex flex-col items-center justify-center w-full gap-0.5">
        <span className="text-3xl font-black text-white opacity-70 leading-none select-none">{arrowChar}</span>
        <span className="text-xs font-bold text-center leading-tight break-words w-full">{raw}</span>
      </div>
    )
  } else if (isLongJutsuList && Array.isArray(result.value)) {
    const shown = result.value.slice(0, 2)
    const restCount = result.value.length - 2
    const fullList = result.value.join(', ')
    displayValue = (
      <span className="group relative inline-block w-full">
        <span className="block truncate">
          {shown.join(', ')} +{restCount} more
        </span>
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-75 bg-popover text-popover-foreground text-xs font-semibold px-2 py-1 rounded shadow-lg border max-w-48 break-words whitespace-normal text-center">
          {fullList}
        </span>
      </span>
    )
  } else {
    displayValue = Array.isArray(result.value)
      ? result.value.length > 0 ? result.value.join(', ') : '—'
      : result.value || '—'
  }

  return (
    <div className={`flex flex-col items-center justify-center w-full h-20 overflow-hidden rounded p-2 whitespace-normal shadow-sm transition-transform duration-100 hover:scale-[1.03] ${feedbackColors[result.feedback]}`}>
      <span className="text-sm font-semibold text-center leading-tight break-words w-full">{displayValue}</span>
    </div>
  )
}
