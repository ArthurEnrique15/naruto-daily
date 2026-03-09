import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Naruto Daily</h1>
      <p className="text-muted-foreground">Daily Naruto character guessing game</p>
      <Button asChild>
        <Link href="/characters">Browse Characters</Link>
      </Button>
    </main>
  );
}
