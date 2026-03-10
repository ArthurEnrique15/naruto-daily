'use client'
import { useState } from 'react'

interface CharacterAvatarProps {
  imageUrl: string
  name: string
  className?: string
}

export default function CharacterAvatar({ imageUrl, name, className = '' }: CharacterAvatarProps) {
  const [failed, setFailed] = useState(false)

  if (failed || !imageUrl) {
    return (
      <span className={`inline-flex items-center justify-center rounded-md bg-muted text-muted-foreground font-bold shrink-0 ${className}`}>
        {name[0]?.toUpperCase() ?? '?'}
      </span>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      onError={() => setFailed(true)}
      referrerPolicy="no-referrer"
      className={`rounded-md object-cover shrink-0 ${className}`}
    />
  )
}
