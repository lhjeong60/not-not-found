import type { Archive } from '../types';
import { BookSpine } from './BookSpine';

interface BookshelfProps {
  archives: Archive[];
  shelfIndex: number;
}

export function Bookshelf({ archives, shelfIndex }: BookshelfProps) {
  return (
    <div
      className="fade-in mb-2"
      style={{ animationDelay: `${shelfIndex * 0.1}s` }}
    >
      {/* Shelf back wall */}
      <div className="shelf-back rounded-t-sm px-2 pb-1 pt-3 sm:px-4">
        {/* Books row */}
        <div className="flex items-end gap-[2px] overflow-x-auto pb-0 sm:gap-1">
          {archives.map((archive) => (
            <BookSpine key={archive.id} archive={archive} />
          ))}
          {/* Empty space filler if few books */}
          {archives.length < 6 && (
            <div className="flex-1" />
          )}
        </div>
      </div>

      {/* Wooden shelf plank */}
      <div className="shelf-plank h-4 rounded-b-sm sm:h-5" />

      {/* Shelf shadow on wall below */}
      <div className="h-3 bg-gradient-to-b from-black/10 to-transparent dark:from-black/30" />
    </div>
  );
}
