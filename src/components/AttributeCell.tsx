import { AttributeResult } from '@/types/game'

interface AttributeCellProps {
  label: string
  result: AttributeResult
}

const feedbackColors = {
  correct: 'bg-green-600 text-white',
  partial: 'bg-yellow-500 text-black',
  wrong: 'bg-gray-500 text-white',
}

export default function AttributeCell({ label, result }: AttributeCellProps) {
  const displayValue = Array.isArray(result.value)
    ? result.value.length > 0 ? result.value.join(', ') : '—'
    : result.value || '—'

  return (
    <div className={`flex flex-col items-center justify-center w-28 h-16 rounded p-1 ${feedbackColors[result.feedback]}`}>
      <span className="text-[10px] uppercase tracking-wide opacity-75">{label}</span>
      <span className="text-xs font-semibold text-center leading-tight">{displayValue}</span>
    </div>
  )
}
