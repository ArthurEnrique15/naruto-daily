import { getPaginatedCharacters } from '@/lib/characters';
import { CharacterCard } from '@/components/CharacterCard';
import { Pagination } from '@/components/Pagination';

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function CharactersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const { characters, total, totalPages } = getPaginatedCharacters(page);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Characters</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {characters.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Pagination currentPage={page} totalPages={totalPages} basePath="/characters" />
      </div>
    </main>
  );
}
