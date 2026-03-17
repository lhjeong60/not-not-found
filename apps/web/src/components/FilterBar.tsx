interface FilterBarProps {
  categories: string[];
  tags: string[];
  selectedCategory: string | undefined;
  selectedTag: string | undefined;
  readFilter: boolean | undefined;
  onCategoryChange: (category: string | undefined) => void;
  onTagChange: (tag: string | undefined) => void;
  onReadFilterChange: (read: boolean | undefined) => void;
}

export function FilterBar({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  readFilter,
  onCategoryChange,
  onTagChange,
  onReadFilterChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {/* Read filter */}
      <div className="flex gap-1 rounded-lg border border-wood-300/30 p-0.5 dark:border-wood-700/30">
        <FilterPill
          active={readFilter === undefined}
          onClick={() => onReadFilterChange(undefined)}
        >
          전체
        </FilterPill>
        <FilterPill
          active={readFilter === false}
          onClick={() => onReadFilterChange(false)}
        >
          안 읽음
        </FilterPill>
        <FilterPill
          active={readFilter === true}
          onClick={() => onReadFilterChange(true)}
        >
          읽음
        </FilterPill>
      </div>

      {/* Category select */}
      {categories.length > 0 && (
        <select
          value={selectedCategory ?? ''}
          onChange={(e) => onCategoryChange(e.target.value || undefined)}
          className="rounded-lg border border-wood-300/30 bg-cream-50 px-3 py-1.5 text-sm
                     text-neutral-700 dark:border-wood-700/30 dark:bg-navy-950 dark:text-cream-200"
        >
          <option value="">모든 카테고리</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}

      {/* Tag pills */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 10).map((tag) => (
            <FilterPill
              key={tag}
              active={selectedTag === tag}
              onClick={() => onTagChange(selectedTag === tag ? undefined : tag)}
            >
              #{tag}
            </FilterPill>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        rounded-md px-2.5 py-1 text-xs font-medium transition-colors
        ${
          active
            ? 'bg-amber-500 text-white shadow-sm dark:bg-amber-600'
            : 'text-wood-500 hover:bg-cream-200 dark:text-wood-400 dark:hover:bg-navy-800'
        }
      `}
    >
      {children}
    </button>
  );
}
