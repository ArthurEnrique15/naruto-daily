const NATURE_ICONS: Record<string, { symbol: string; className: string }> = {
  Earth:      { symbol: '土', className: 'bg-amber-700' },
  Fire:       { symbol: '火', className: 'bg-red-500' },
  Lightning:  { symbol: '雷', className: 'bg-yellow-400 text-black' },
  Water:      { symbol: '水', className: 'bg-blue-500' },
  Wind:       { symbol: '風', className: 'bg-green-500' },
  Yin:        { symbol: '陰', className: 'bg-purple-800' },
  Yang:       { symbol: '陽', className: 'bg-orange-300 text-black' },
  'Yin-Yang': { symbol: '陰陽', className: 'bg-gray-700' },
}

export function getNatureIcon(name: string): { symbol: string; className: string } {
  return NATURE_ICONS[name] ?? { symbol: name[0], className: 'bg-gray-500' }
}
