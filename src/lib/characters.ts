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
  pageSize: number = 12
): { characters: Character[]; totalPages: number; total: number } {
  const source = getAllCharacters();
  const total = source.length;
  const totalPages = Math.ceil(total / pageSize);
  const safePage = Math.max(1, Math.min(page, totalPages || 1));
  const characters = source.slice((safePage - 1) * pageSize, safePage * pageSize);
  return { characters, totalPages, total };
}
