import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button-variants';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Naruto Daily</h1>
      <p className="text-muted-foreground">Daily Naruto character guessing game</p>
      <Link href="/characters" className={buttonVariants()}>
        Browse Characters
      </Link>
    </main>
  );
}
