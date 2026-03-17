interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, total, limit, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <nav className="flex items-center justify-center gap-1 py-6" aria-label="페이지네이션">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md px-3 py-1.5 text-sm text-wood-500 transition-colors
                   hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-40
                   dark:text-wood-400 dark:hover:bg-navy-800"
      >
        이전
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-wood-400 dark:text-wood-600">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`
              h-8 w-8 rounded-md text-sm font-medium transition-colors
              ${
                p === page
                  ? 'bg-amber-500 text-white shadow-sm dark:bg-amber-600'
                  : 'text-wood-500 hover:bg-cream-200 dark:text-wood-400 dark:hover:bg-navy-800'
              }
            `}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md px-3 py-1.5 text-sm text-wood-500 transition-colors
                   hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-40
                   dark:text-wood-400 dark:hover:bg-navy-800"
      >
        다음
      </button>
    </nav>
  );
}
