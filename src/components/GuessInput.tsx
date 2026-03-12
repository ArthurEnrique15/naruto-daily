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
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  function normalize(s: string) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  }

  const filtered = query.trim()
    ? characters
        .filter((c) => normalize(c.name).includes(normalize(query)))
        .slice(0, 8)
    : []

  const selectableItems = filtered.filter((c) => !guessedIds.has(c.id))

  function handleSelect(char: Character) {
    if (guessedIds.has(char.id)) return
    onGuess(char)
    setQuery('')
    setOpen(false)
    setSelectedIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = selectedIndex < selectableItems.length - 1 ? selectedIndex + 1 : 0
      setSelectedIndex(next)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = selectedIndex <= 0 ? selectableItems.length - 1 : selectedIndex - 1
      setSelectedIndex(prev)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectableItems[selectedIndex]) {
        handleSelect(selectableItems[selectedIndex])
        return
      }
      const first = selectableItems[0]
      if (first) handleSelect(first)
    }
  }

  useEffect(() => {
    if (selectedIndex < 0 || !listRef.current) return
    const selected = selectableItems[selectedIndex]
    if (!selected) return
    const idx = filtered.findIndex((c) => c.id === selected.id)
    if (idx >= 0) {
      const el = listRef.current.children[idx] as HTMLElement | undefined
      el?.scrollIntoView({ block: 'nearest' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only scroll when selectedIndex changes
  }, [selectedIndex])

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
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setSelectedIndex(-1) }}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        disabled={disabled}
        placeholder="Guess a character…"
        className="w-full border rounded px-3 py-2 text-sm bg-background disabled:opacity-50"
      />
      {open && filtered.length > 0 && (
        <ul ref={listRef} className="absolute z-50 mt-1 w-full border rounded bg-popover shadow-md max-h-60 overflow-auto">
          {filtered.map((char) => {
            const alreadyGuessed = guessedIds.has(char.id)
            const selectedChar = selectableItems[selectedIndex]
            const isSelected = selectedChar?.id === char.id
            return (
              <li
                key={char.id}
                onClick={() => handleSelect(char)}
                className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent ${isSelected ? 'bg-accent' : ''} ${alreadyGuessed ? 'opacity-40 line-through cursor-default' : ''}`}
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
