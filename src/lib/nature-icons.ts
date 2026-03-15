const NATURE_ICONS: Record<string, string> = {
  Earth: '/nature-icons/nature-icon-earth.webp',
  Fire: '/nature-icons/nature-icon-fire.webp',
  Lightning: '/nature-icons/nature-icon-lightning.webp',
  Water: '/nature-icons/nature-icon-water.webp',
  Wind: '/nature-icons/nature-icon-wind.webp',
  Yin: '/nature-icons/nature-icon-yin.svg',
  Yang: '/nature-icons/nature-icon-yang.svg',
  'Yin-Yang': '/nature-icons/nature-icon-yin-yang.svg',
}

export function getNatureIconPath(name: string): string {
  return NATURE_ICONS[name] ?? ''
}
