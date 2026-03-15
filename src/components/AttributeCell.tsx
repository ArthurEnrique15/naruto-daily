import Image from 'next/image'
import { ArrowBigDown, ArrowBigUp } from 'lucide-react'
import { AttributeResult } from '@/types/game'
import { getNatureIconPath } from '@/lib/nature-icons'

interface AttributeCellProps {
  label: string
  result: AttributeResult
}

const feedbackColors = {
  correct: 'bg-green-600 text-white border border-green-500 hover:bg-green-700 hover:text-white/80',
  partial: 'bg-yellow-500 text-black border border-yellow-400 hover:bg-yellow-600 hover:text-black/80',
  wrong: 'bg-red-600 text-white border border-red-500 hover:bg-red-700 hover:text-white/80',
}

export default function AttributeCell({ label, result }: AttributeCellProps) {
  const isNatureTypes = label === 'Nature Types' && Array.isArray(result.value)
  const isDebutArc = label === 'Debut Arc'
  const isJutsuTypes = label === 'Jutsu Types' && Array.isArray(result.value)
  const isLongJutsuList = isJutsuTypes && result.value.length >= 4
  const isLongAffiliations = label === 'Affiliations' && Array.isArray(result.value) && result.value.length > 2

  let displayValue: React.ReactNode

  if (isNatureTypes && Array.isArray(result.value)) {
    if (result.value.length === 0) {
      displayValue = '—'
    } else {
      displayValue = (
        <span className="flex flex-wrap gap-1 justify-center">
          {result.value.map((nature) => {
            return (
              <span
                key={nature}
                className="relative group/nature inline-flex items-center justify-center"
              >
                <Image
                  src={getNatureIconPath(nature)}
                  alt={nature}
                  width={28}
                  height={28}
                  className="object-contain"
                />
                <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-50 pointer-events-none opacity-0 group-hover/nature:opacity-100 transition-opacity duration-75 bg-popover text-popover-foreground text-xs font-semibold px-2 py-1 rounded shadow-lg border whitespace-nowrap">
                  {nature}
                </span>
              </span>
            )
          })}
        </span>
      )
    }
  } else if (isDebutArc && result.feedback === 'wrong' && result.direction) {
    const ArrowIcon = result.direction === 'before' ? ArrowBigDown : ArrowBigUp
    const raw = Array.isArray(result.value)
      ? result.value.length > 0 ? result.value.join(', ') : '—'
      : result.value || '—'
    displayValue = (
      <div className="relative flex items-center justify-center w-full h-full">
        <ArrowIcon className="absolute text-red-950 opacity-80 fill-red-950" size={80} strokeWidth={2} />
        <span className="relative text-xs font-bold text-center leading-tight break-words w-full z-10">{raw}</span>
      </div>
    )
  } else if (isLongJutsuList && Array.isArray(result.value)) {
    const shown = result.value.slice(0, 3)
    const restCount = result.value.length - 3
    const fullList = result.value.join(', ')
    displayValue = (
      <span className="group relative inline-block w-full">
        <span className="block text-left">
          {shown.map((item) => (
            <span key={item} className="block leading-tight">{item},</span>
          ))}
          <span className="block leading-tight">+{restCount} more</span>
        </span>
        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-75 bg-popover text-popover-foreground text-xs font-semibold px-2 py-1 rounded shadow-lg border max-w-48 break-words whitespace-normal text-center">
          {fullList}
        </span>
      </span>
    )
  } else if (isLongAffiliations && Array.isArray(result.value)) {
    const shown = result.value.slice(0, 2)
    const restCount = result.value.length - 2
    const fullList = result.value.join(', ')
    displayValue = (
      <span className="group relative inline-block w-full">
        <span className="block truncate">
          {shown.join(', ')} +{restCount} more
        </span>
        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-75 bg-popover text-popover-foreground text-xs font-semibold px-2 py-1 rounded shadow-lg border max-w-48 break-words whitespace-normal text-center">
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
    <div className={`flex flex-col items-center justify-center w-full h-20 rounded p-2 whitespace-normal shadow-sm transition-colors duration-100 ${feedbackColors[result.feedback]}`}>
      <span className="text-sm font-semibold text-center leading-tight break-words w-full">{displayValue}</span>
    </div>
  )
}
