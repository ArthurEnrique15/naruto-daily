import { readFileSync } from 'fs';
import path from 'path';
import { Character } from '@/types/character';

let cachedCharacters: Character[] | null = null;

export function getAllCharacters(): Character[] {
  if (cachedCharacters) return cachedCharacters;
  const filePath = path.join(process.cwd(), 'data', 'characters.json');
  const raw = readFileSync(filePath, 'utf-8');
  cachedCharacters = JSON.parse(raw) as Character[];
  return cachedCharacters;
}

export function getPaginatedCharacters(
  page: number,
  pageSize: number = 20
): { characters: Character[]; total: number; totalPages: number } {
  const all = getAllCharacters();
  const total = all.length;
  const totalPages = Math.ceil(total / pageSize);
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * pageSize;
  const characters = all.slice(start, start + pageSize);
  return { characters, total, totalPages };
}
