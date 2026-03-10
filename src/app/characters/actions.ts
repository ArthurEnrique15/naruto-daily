'use server';

import { revalidatePath } from 'next/cache';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { clearCharactersCache } from '@/lib/characters';
import type { Character } from '@/types/character';

const DATA_PATH = join(process.cwd(), 'data', 'characters.json');

function readCharacters(): Character[] {
  return JSON.parse(readFileSync(DATA_PATH, 'utf-8')) as Character[];
}

function writeCharacters(characters: Character[]): void {
  writeFileSync(DATA_PATH, JSON.stringify(characters, null, 2), 'utf-8');
}

export async function deleteCharacter(id: string): Promise<void> {
  const characters = readCharacters();
  const index = characters.findIndex((c) => c.id === id);
  if (index === -1) return;

  characters[index] = { ...characters[index], deletedAt: new Date().toISOString() };
  writeCharacters(characters);
  clearCharactersCache();
  revalidatePath('/characters');
}

export async function restoreCharacter(id: string): Promise<void> {
  const characters = readCharacters();
  const index = characters.findIndex((c) => c.id === id);
  if (index === -1) return;

  const updated = { ...characters[index] };
  delete updated.deletedAt;
  characters[index] = updated;
  writeCharacters(characters);
  clearCharactersCache();
  revalidatePath('/characters');
}
