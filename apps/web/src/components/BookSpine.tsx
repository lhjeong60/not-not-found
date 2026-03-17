import { Link } from 'react-router-dom';
import type { Archive } from '../types';

/** Deterministic book color based on archive id */
const BOOK_COLORS = [
  { bg: 'bg-book-red', border: 'border-red-900' },
  { bg: 'bg-book-blue', border: 'border-blue-900' },
  { bg: 'bg-book-green', border: 'border-green-900' },
  { bg: 'bg-book-purple', border: 'border-purple-900' },
  { bg: 'bg-book-teal', border: 'border-teal-900' },
  { bg: 'bg-book-brown', border: 'border-amber-900' },
  { bg: 'bg-book-navy', border: 'border-indigo-900' },
  { bg: 'bg-book-wine', border: 'border-pink-900' },
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getBookColor(id: string) {
  return BOOK_COLORS[hashCode(id) % BOOK_COLORS.length];
}

/** Vary book width slightly for visual interest */
function getBookWidth(id: string): number {
  const base = 48;
  const variation = hashCode(id + 'w') % 20;
  return base + variation; // 48-68px
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
}

interface BookSpineProps {
  archive: Archive;
}

export function BookSpine({ archive }: BookSpineProps) {
  const color = getBookColor(archive.id);
  const width = getBookWidth(archive.id);
  const isUnread = !archive.read;

  return (
    <Link
      to={`/archive/${archive.id}`}
      className={`
        book-spine group relative flex flex-col items-center
        rounded-sm border-l-2 border-r
        ${color.bg} ${color.border}
        ${isUnread ? 'book-unread' : 'book-read'}
        cursor-pointer no-underline
      `}
      style={{ width: `${width}px`, height: '200px' }}
      title={`${archive.title} — ${archive.domain}`}
    >
      {/* Gold foil decoration at top */}
      <div className="mt-2 h-px w-3/4 bg-amber-400/40" />

      {/* Title - vertical text */}
      <div className="vertical-text flex-1 overflow-hidden px-1 py-2">
        <span className="line-clamp-3 text-xs font-medium leading-tight text-cream-100/90 dark:text-cream-200/90">
          {archive.title}
        </span>
      </div>

      {/* Domain favicon */}
      <div className="mb-1 flex flex-col items-center gap-1 pb-1">
        <img
          src={faviconUrl(archive.domain)}
          alt=""
          className="h-3 w-3 rounded-sm opacity-70"
          loading="lazy"
        />
        <span className="text-[8px] text-cream-200/50">
          {formatDate(archive.createdAt)}
        </span>
      </div>

      {/* Gold foil decoration at bottom */}
      <div className="mb-2 h-px w-3/4 bg-amber-400/40" />

      {/* Hover tooltip */}
      <div className="pointer-events-none absolute -top-12 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-900/90 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-neutral-800">
        {archive.title}
        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-neutral-900/90 dark:bg-neutral-800" />
      </div>
    </Link>
  );
}
