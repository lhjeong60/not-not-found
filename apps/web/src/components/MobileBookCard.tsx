import { Link } from 'react-router-dom';
import type { Archive } from '../types';

interface MobileBookCardProps {
  archive: Archive;
  index: number;
}

function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function MobileBookCard({ archive, index }: MobileBookCardProps) {
  return (
    <Link
      to={`/archive/${archive.id}`}
      className="fade-in block rounded-lg border border-wood-300/30 bg-cream-50 p-3
                 no-underline shadow-sm transition-shadow hover:shadow-md
                 dark:border-wood-700/30 dark:bg-navy-950"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start gap-3">
        <img
          src={faviconUrl(archive.domain)}
          alt=""
          className="mt-0.5 h-5 w-5 flex-shrink-0 rounded"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <h3
            className={`truncate text-sm font-medium ${
              archive.read
                ? 'text-wood-400 dark:text-wood-600'
                : 'text-neutral-800 dark:text-cream-200'
            }`}
          >
            {archive.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-wood-400 dark:text-wood-600">
            <span>{archive.domain}</span>
            <span>&middot;</span>
            <span>{formatDate(archive.createdAt)}</span>
          </div>
          {archive.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {archive.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-cream-200/60 px-1.5 py-0.5 text-[10px] text-wood-500 dark:bg-navy-800 dark:text-wood-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {!archive.read && (
          <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
        )}
      </div>
    </Link>
  );
}
