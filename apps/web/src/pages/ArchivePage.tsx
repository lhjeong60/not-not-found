import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getArchive, updateArchive } from '../api/client';
import type { GetArchiveResponse } from '../types';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

export function ArchivePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [archive, setArchive] = useState<GetArchiveResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getArchive(id)
      .then(setArchive)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMarkRead = useCallback(async () => {
    if (!archive || !id) return;
    try {
      const updated = await updateArchive(id, { read: !archive.read });
      setArchive((prev) =>
        prev ? { ...prev, read: updated.read } : prev,
      );
    } catch {
      // Silently fail — could add toast
    }
  }, [archive, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="text-sm text-wood-400 dark:text-wood-600">
            페이지를 펼치는 중...
          </p>
        </div>
      </div>
    );
  }

  if (error || !archive) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="mb-4 text-5xl">📕</span>
        <h3 className="font-serif text-lg text-wood-600 dark:text-wood-400">
          아카이브를 찾을 수 없습니다
        </h3>
        <p className="mt-1 text-sm text-wood-400 dark:text-wood-600">
          {error ?? '존재하지 않는 아카이브입니다.'}
        </p>
        <Link
          to="/"
          className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm text-white transition-colors hover:bg-amber-600"
        >
          도서관으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="page-enter flex h-[calc(100vh-64px)] flex-col lg:flex-row">
      {/* Sidebar - Metadata */}
      <aside
        className={`
          flex-shrink-0 overflow-y-auto border-b border-wood-300/20 bg-cream-50 p-4
          transition-all dark:border-wood-700/20 dark:bg-navy-950
          lg:w-80 lg:border-b-0 lg:border-r
          ${sidebarOpen ? 'max-h-96 lg:max-h-none' : 'max-h-0 overflow-hidden lg:max-h-none'}
        `}
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center gap-1 text-sm text-wood-500 transition-colors hover:text-wood-700 dark:text-wood-400 dark:hover:text-cream-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          도서관으로 돌아가기
        </button>

        {/* Title */}
        <div className="mb-4 flex items-start gap-3">
          <img
            src={faviconUrl(archive.domain)}
            alt=""
            className="mt-1 h-6 w-6 flex-shrink-0 rounded"
          />
          <h1 className="font-serif text-lg font-bold leading-snug text-neutral-800 dark:text-cream-200">
            {archive.title}
          </h1>
        </div>

        {/* Metadata */}
        <dl className="space-y-3 text-sm">
          <MetadataRow label="URL">
            <a
              href={archive.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-amber-600 underline-offset-2 hover:underline dark:text-amber-400"
            >
              {archive.url}
            </a>
          </MetadataRow>

          <MetadataRow label="도메인">
            <span>{archive.domain}</span>
          </MetadataRow>

          <MetadataRow label="아카이브 날짜">
            <span>{formatDate(archive.createdAt)}</span>
          </MetadataRow>

          {archive.category && (
            <MetadataRow label="카테고리">
              <span className="rounded bg-cream-200/80 px-2 py-0.5 text-xs dark:bg-navy-800">
                {archive.category}
              </span>
            </MetadataRow>
          )}

          {archive.tags.length > 0 && (
            <MetadataRow label="태그">
              <div className="flex flex-wrap gap-1">
                {archive.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-cream-200/80 px-2 py-0.5 text-xs dark:bg-navy-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </MetadataRow>
          )}
        </dl>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={handleMarkRead}
            className={`
              flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors
              ${
                archive.read
                  ? 'border border-wood-300/40 text-wood-500 hover:bg-cream-200 dark:border-wood-700/40 dark:text-wood-400 dark:hover:bg-navy-800'
                  : 'bg-amber-500 text-white shadow-sm hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700'
              }
            `}
          >
            {archive.read ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                읽음 (취소하려면 클릭)
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                읽음으로 표시
              </>
            )}
          </button>

          {archive.summaryUrl && (
            <a
              href={archive.summaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border border-wood-300/40 px-4 py-2 text-sm text-wood-500 transition-colors hover:bg-cream-200 dark:border-wood-700/40 dark:text-wood-400 dark:hover:bg-navy-800"
            >
              요약 보기
            </a>
          )}
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex items-center justify-center gap-1 border-b border-wood-300/20 py-1.5 text-xs text-wood-400 dark:border-wood-700/20 dark:text-wood-600 lg:hidden"
      >
        {sidebarOpen ? '정보 접기' : '정보 펼치기'}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-3 w-3 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Content iframe */}
      <div className="flex-1 bg-white dark:bg-neutral-900">
        <iframe
          src={archive.contentUrl}
          title={archive.title}
          className="h-full w-full border-0"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}

function MetadataRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-wood-400 dark:text-wood-600">
        {label}
      </dt>
      <dd className="mt-0.5 text-neutral-700 dark:text-cream-300">
        {children}
      </dd>
    </div>
  );
}
