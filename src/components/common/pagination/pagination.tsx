'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, setCurrentPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const delta = 2;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);
    if (left > 2) pages.push('ellipsis');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('ellipsis');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={currentPage <= 1}
        aria-label="Previous page"
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </Button>
      {getPageNumbers().map((page, idx) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground" aria-hidden="true">...</span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={currentPage >= totalPages}
        aria-label="Next page"
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
