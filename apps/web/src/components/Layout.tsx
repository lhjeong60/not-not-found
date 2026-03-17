import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { useDarkMode } from '../hooks/useDarkMode';

export function Layout() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="flex min-h-screen flex-col bg-cream-100 text-neutral-800 dark:bg-navy-900 dark:text-cream-300">
      <Header isDark={isDark} onToggleDark={toggle} />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-wood-400/20 py-4 text-center text-sm text-wood-400 dark:text-wood-600">
        <p className="font-serif italic">
          "여기선 사라지지 않는다." &mdash; Not Not Found
        </p>
      </footer>
    </div>
  );
}
