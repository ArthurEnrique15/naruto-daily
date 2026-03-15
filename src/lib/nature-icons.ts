const NATURE_ICONS: Record<string, { imagePath: string; className: string }> = {
  Earth: { imagePath: '/nature-icons/nature-icon-earth.webp', className: 'bg-amber-700' },
  Fire: { imagePath: '/nature-icons/nature-icon-fire.webp', className: 'bg-red-500' },
  Lightning: { imagePath: '/nature-icons/nature-icon-lightning.webp', className: 'bg-yellow-400' },
  Water: { imagePath: '/nature-icons/nature-icon-water.webp', className: 'bg-blue-500' },
  Wind: { imagePath: '/nature-icons/nature-icon-wind.webp', className: 'bg-green-500' },
  Yin: { imagePath: '/nature-icons/nature-icon-yin.svg', className: 'bg-purple-800' },
  Yang: { imagePath: '/nature-icons/nature-icon-yang.svg', className: 'bg-orange-300' },
  'Yin-Yang': { imagePath: '/nature-icons/nature-icon-yin-yang.svg', className: 'bg-gray-700' },
}

export function getNatureIcon(name: string): { imagePath: string | null; className: string } {
  return NATURE_ICONS[name] ?? { imagePath: null, className: 'bg-gray-500' }
}
