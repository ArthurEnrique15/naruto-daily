import Link from 'next/link'
import { getPaginatedCharacters } from '@/lib/characters';
import { CharacterCard } from '@/components/CharacterCard';
import { Pagination } from '@/components/Pagination';

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function CharactersPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10));

  const { characters, totalPages, total } = getPaginatedCharacters(page);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="px-4 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          ← Back to game
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-2">Characters</h1>
      <p className="text-muted-foreground mb-6">{total} characters</p>

      {characters.length === 0 ? (
        <p className="text-muted-foreground">No characters found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {characters.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Pagination currentPage={page} totalPages={totalPages} basePath="/characters" />
      </div>
    </main>
  );
}
