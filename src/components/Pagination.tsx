import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  const prev = currentPage - 1;
  const next = currentPage + 1;

  return (
    <div className="flex items-center gap-4">
      {currentPage > 1 ? (
        <Button asChild variant="outline" size="sm">
          <Link href={`${basePath}?page=${prev}`}>← Previous</Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>← Previous</Button>
      )}

      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Button asChild variant="outline" size="sm">
          <Link href={`${basePath}?page=${next}`}>Next →</Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>Next →</Button>
      )}
    </div>
  );
}
