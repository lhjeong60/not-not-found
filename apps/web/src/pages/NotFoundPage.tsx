import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="fade-in">
        {/* Ironic 404 */}
        <h2 className="font-serif text-8xl font-bold text-wood-300 dark:text-wood-700">
          404
        </h2>
        <h3 className="mt-2 font-serif text-2xl font-bold text-wood-600 dark:text-cream-300">
          아이러니하게도...
        </h3>
        <p className="mx-auto mt-3 max-w-md text-wood-400 dark:text-wood-500">
          다른 페이지들이 사라지지 않도록 지키는 곳에서,
          <br />
          이 페이지는 존재하지 않습니다.
        </p>
        <p className="mt-2 font-serif text-sm italic text-wood-300 dark:text-wood-600">
          "404를 막겠다던 자가 404를 만들다니."
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
          </svg>
          도서관으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
