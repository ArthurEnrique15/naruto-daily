import { getPaginatedCharacters } from '@/lib/characters';
import { CharacterCard } from '@/components/CharacterCard';
import { CharacterActions } from '@/components/CharacterActions';
import { Pagination } from '@/components/Pagination';

interface Props {
  searchParams: Promise<{ page?: string; tab?: string }>;
}

export default async function CharactersPage({ searchParams }: Props) {
  const { page: pageParam, tab: tabParam } = await searchParams;
  const tab = tabParam === 'deleted' ? 'deleted' : 'active';
  const page = Math.max(1, parseInt(pageParam ?? '1', 10));

  const { characters, totalPages, total } = getPaginatedCharacters(page, tab);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Characters</h1>
      <p className="text-muted-foreground mb-6">{total} characters</p>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        <a
          href={`/characters?tab=active`}
          className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
            tab === 'active'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-foreground border-border hover:bg-muted'
          }`}
        >
          Active
        </a>
        <a
          href={`/characters?tab=deleted`}
          className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
            tab === 'deleted'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-foreground border-border hover:bg-muted'
          }`}
        >
          Deleted
        </a>
      </div>

      {characters.length === 0 ? (
        <p className="text-muted-foreground">No characters found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {characters.map((character) => (
            <div key={character.id} className="flex flex-col gap-2">
              <CharacterCard character={character} />
              {character.deletedAt && (
                <p className="text-xs text-muted-foreground text-center">
                  Deleted {new Date(character.deletedAt).toLocaleDateString()}
                </p>
              )}
              <CharacterActions id={character.id} isDeleted={tab === 'deleted'} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Pagination currentPage={page} totalPages={totalPages} basePath={`/characters?tab=${tab}`} />
      </div>
    </main>
  );
}
