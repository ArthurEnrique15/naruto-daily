'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { deleteCharacter, restoreCharacter } from '@/app/characters/actions';

interface CharacterActionsProps {
  id: string;
  isDeleted: boolean;
}

export function CharacterActions({ id, isDeleted }: CharacterActionsProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(() => deleteCharacter(id));
  }

  function handleRestore() {
    startTransition(() => restoreCharacter(id));
  }

  if (isDeleted) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleRestore}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? 'Restoring…' : 'Restore'}
      </Button>
    );
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="w-full"
    >
      {isPending ? 'Deleting…' : 'Delete'}
    </Button>
  );
}
