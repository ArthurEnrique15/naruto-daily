import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Character } from '@/types/character';

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-2">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={character.imageUrl}
            alt={character.name}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="text-center text-sm font-semibold leading-none tracking-tight">{character.name}</h2>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-xs">
        <Row label="Village" values={character.village} />
        <Row label="Rank" values={[character.rank]} />
        <Row label="Gender" values={[character.gender]} />
        <Row label="Status" values={[character.status]} />
        <Row label="Debut Arc" values={[character.debutArc]} />
        <Row label="Species" values={character.species} />
        <Row label="Nature Types" values={character.natureTypes} />
        <Row label="Kekkei Genkai" values={character.kekkeiGenkai} />
        <Row label="Jutsu Types" values={character.jutsuTypes} />
        {character.occupation && <Row label="Occupation" values={[character.occupation]} />}
      </CardContent>
    </Card>
  );
}

function Row({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="flex flex-wrap items-start gap-1">
      <span className="font-semibold text-muted-foreground">{label}:</span>
      {values.length > 0 ? (
        values.map((v) => (
          <Badge key={v} variant="secondary" className="text-xs">
            {v}
          </Badge>
        ))
      ) : (
        <Badge variant="secondary" className="text-xs text-muted-foreground">
          N/A
        </Badge>
      )}
    </div>
  );
}
