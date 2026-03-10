'use client'

import { useState, useRef, useEffect } from 'react'
import { Character } from '@/types/character'
import CharacterAvatar from '@/components/CharacterAvatar'

interface GuessInputProps {
  characters: Character[]
  guessedIds: Set<string>
  onGuess: (character: Character) => void
  disabled: boolean
}

export default function GuessInput({ characters, guessedIds, onGuess, disabled }: GuessInputProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = query.trim()
    ? characters
        .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8)
    : []

  function handleSelect(char: Character) {
    if (guessedIds.has(char.id)) return
    onGuess(char)
    setQuery('')
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && filtered.length > 0) {
      const first = filtered.find((c) => !guessedIds.has(c.id))
      if (first) handleSelect(first)
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-80">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        disabled={disabled}
        placeholder="Guess a character…"
        className="w-full border rounded px-3 py-2 text-sm bg-background disabled:opacity-50"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full border rounded bg-popover shadow-md max-h-60 overflow-auto">
          {filtered.map((char) => {
            const alreadyGuessed = guessedIds.has(char.id)
            return (
              <li
                key={char.id}
                onClick={() => handleSelect(char)}
                className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent ${alreadyGuessed ? 'opacity-40 line-through cursor-default' : ''}`}
              >
                <CharacterAvatar imageUrl={char.imageUrl} name={char.name} className="w-6 h-6" />
                {char.name}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
