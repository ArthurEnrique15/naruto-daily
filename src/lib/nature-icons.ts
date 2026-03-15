const NATURE_ICONS: Record<string, string> = {
  Earth: '/nature-icons/nature-icon-earth.svg',
  Fire: '/nature-icons/nature-icon-fire.svg',
  Lightning: '/nature-icons/nature-icon-lightning.svg',
  Water: '/nature-icons/nature-icon-water.svg',
  Wind: '/nature-icons/nature-icon-wind.svg',
  Yin: '/nature-icons/nature-icon-yin.svg',
  Yang: '/nature-icons/nature-icon-yang.svg',
  'Yin-Yang': '/nature-icons/nature-icon-yin-yang.svg',
}

export function getNatureIconPath(name: string): string {
  return NATURE_ICONS[name] ?? ''
}
