'use client'
import { useState } from 'react'
import { Character } from '@/types/character'

interface DevBannerProps {
  currentCharacter: Character
  onNewCharacter: () => void
  onReset: () => void
}

export default function DevBanner({ currentCharacter, onNewCharacter, onReset }: DevBannerProps) {
  const [show, setShow] = useState(false)
  return (
    <div className="w-full bg-yellow-300 text-black text-sm px-4 py-2 flex items-center gap-4 rounded">
      <span>
        [DEV] Current:{' '}
        {show ? <strong>{currentCharacter.name}</strong> : <span className="text-yellow-600">••••••</span>}
      </span>
      <button onClick={() => setShow((s) => !s)} className="underline hover:no-underline">
        {show ? '🙈 Hide' : '👁 Reveal'}
      </button>
      <button onClick={onNewCharacter} className="underline hover:no-underline">🎲 New Character</button>
      <button onClick={onReset} className="underline hover:no-underline">↺ Reset Guesses</button>
    </div>
  )
}
