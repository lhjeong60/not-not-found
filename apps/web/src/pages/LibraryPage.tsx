import { useMemo, useCallback } from 'react';
import { useArchives } from '../hooks/useArchives';
import { Bookshelf } from '../components/Bookshelf';
import { SearchBar } from '../components/SearchBar';
import { FilterBar } from '../components/FilterBar';
import { Pagination } from '../components/Pagination';
import { MobileBookCard } from '../components/MobileBookCard';
import type { Archive } from '../types';

/** Split archives into rows of N for bookshelves */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export function LibraryPage() {
  const { archives, total, page, limit, loading, error, setQuery, query } =
    useArchives();

  /** Extract unique categories and tags from current results */
  const { categories, tags } = useMemo(() => {
    const catSet = new Set<string>();
    const tagSet = new Set<string>();
    archives.forEach((a: Archive) => {
      if (a.category) catSet.add(a.category);
      a.tags.forEach((t: string) => tagSet.add(t));
    });
    return {
      categories: Array.from(catSet).sort(),
      tags: Array.from(tagSet).sort(),
    };
  }, [archives]);

  const booksPerShelf = 8;
  const shelves = useMemo(
    () => chunkArray(archives, booksPerShelf),
    [archives],
  );

  const handleSearch = useCallback(
    (search: string) => {
      setQuery({ ...query, search, page: 1 });
    },
    [query, setQuery],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setQuery({ ...query, page: newPage });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [query, setQuery],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Library heading */}
      <div className="mb-6 text-center">
        <h2 className="font-serif text-2xl font-bold text-wood-700 dark:text-cream-300 sm:text-3xl">
          나의 디지털 도서관
        </h2>
        <p className="mt-1 text-sm text-wood-400 dark:text-wood-600">
          {total > 0
            ? `${total}권의 아카이브가 소장되어 있습니다`
            : '아직 아카이브가 없습니다'}
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={query.search ?? ''} onChange={handleSearch} />
        <FilterBar
          categories={categories}
          tags={tags}
          selectedCategory={query.category}
          selectedTag={query.tag}
          readFilter={query.read}
          onCategoryChange={(category) =>
            setQuery({ ...query, category, page: 1 })
          }
          onTagChange={(tag) => setQuery({ ...query, tag, page: 1 })}
          onReadFilterChange={(read) =>
            setQuery({ ...query, read, page: 1 })
          }
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            <p className="text-sm text-wood-400 dark:text-wood-600">
              서가를 정리하는 중...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mx-auto max-w-md rounded-lg border border-red-300/50 bg-red-50 p-4 text-center dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && archives.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="mb-4 text-6xl">📖</span>
          <h3 className="font-serif text-lg text-wood-600 dark:text-wood-400">
            텅 빈 서가
          </h3>
          <p className="mt-1 text-sm text-wood-400 dark:text-wood-600">
            크롬 익스텐션으로 첫 번째 페이지를 아카이브해 보세요.
          </p>
        </div>
      )}

      {/* Desktop: Bookshelf view */}
      {!loading && !error && archives.length > 0 && (
        <>
          {/* Desktop shelves */}
          <div className="hidden sm:block">
            {shelves.map((shelfArchives, idx) => (
              <Bookshelf
                key={`shelf-${idx}`}
                archives={shelfArchives}
                shelfIndex={idx}
              />
            ))}
          </div>

          {/* Mobile: Card list view */}
          <div className="flex flex-col gap-3 sm:hidden">
            {archives.map((archive, idx) => (
              <MobileBookCard
                key={archive.id}
                archive={archive}
                index={idx}
              />
            ))}
          </div>

          <Pagination
            page={page}
            total={total}
            limit={limit}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
