import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  const prev = currentPage - 1;
  const next = currentPage + 1;
  const sep = basePath.includes('?') ? '&' : '?';

  return (
    <div className="flex items-center gap-4">
      {currentPage > 1 ? (
        <Link
          href={`${basePath}${sep}page=${prev}`}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          ← Previous
        </Link>
      ) : (
        <span className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'pointer-events-none opacity-50')}>
          ← Previous
        </span>
      )}

      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={`${basePath}${sep}page=${next}`}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          Next →
        </Link>
      ) : (
        <span className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'pointer-events-none opacity-50')}>
          Next →
        </span>
      )}
    </div>
  );
}
