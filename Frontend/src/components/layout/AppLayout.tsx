import { Menu, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useSearchParams } from 'react-router-dom';
import logoMark from '../../assets/thefeeds-mark.svg';
import { SiteFooter } from './SiteFooter';
import { useApiHealth, useNewsFilters } from '../../hooks/useNews';
import { useAuth } from '../../store/AuthContext';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative shrink-0 py-3 text-sm font-semibold transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
    isActive ? 'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-accent' : 'text-muted'
  }`;

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const filters = useNewsFilters();
  const health = useApiHealth();
  const { user, signOut } = useAuth();
  const sections = filters.data?.sections ?? [];
  const country = searchParams.get('country');
  const sectionPath = (slug: string) =>
    `/news/${slug}${country ? `?country=${encodeURIComponent(country)}` : ''}`;

  return (
    <div className="min-h-screen bg-white text-ink">
      <div className="border-b border-white/15 bg-[#111820] px-4 py-1.5 text-center text-xs font-medium tracking-wide text-white">
        Independent stories. A wider view.
      </div>
      <header className="relative z-10 border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-7">
          <Link
            to={country ? `/?country=${encodeURIComponent(country)}` : '/'}
            className="flex shrink-0 items-center gap-2.5 text-xl font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            aria-label="TheFeeds home"
            onClick={() => setMenuOpen(false)}
          >
            <img src={logoMark} alt="" className="size-10" />
            <span className="text-[1.35rem]">TheFeeds</span>
          </Link>

          <div className="hidden items-center gap-4 sm:flex">
            {user ? (
              <>
                <span className="max-w-32 truncate text-sm text-muted">Hello, {user.name}</span>
                <button
                  type="button"
                  onClick={signOut}
                  className="text-sm font-semibold text-ink underline-offset-4 hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-ink hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Sign in</Link>
                <Link to="/register" className="bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#941e25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Register</Link>
              </>
            )}
            <Link
              to="/search"
              aria-label="Search TheFeeds"
              className="grid size-10 place-items-center border border-line text-ink hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Search size={18} aria-hidden="true" />
            </Link>
          </div>

          <button
            type="button"
            className="grid size-10 place-items-center text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:hidden"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        <nav
          className="scrollbar-none mx-auto hidden max-w-[1440px] items-center gap-6 overflow-x-auto px-4 sm:flex sm:px-7"
          aria-label="News sections"
        >
          {sections.map((section) => (
            <NavLink
              key={section.slug}
              to={sectionPath(section.slug)}
              className={navLinkClass}
            >
              {section.label}
            </NavLink>
          ))}
          <NavLink to={country ? `/search?country=${encodeURIComponent(country)}` : '/search'} className={navLinkClass}>Search</NavLink>
        </nav>
        {menuOpen && (
          <nav
            id="mobile-navigation"
            className="border-t border-line bg-white px-4 py-3 sm:hidden"
            aria-label="Mobile navigation and news sections"
          >
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              {sections.map((section) => (
                <NavLink
                  key={section.slug}
                  to={sectionPath(section.slug)}
                  className={navLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {section.label}
                </NavLink>
              ))}
              <NavLink to={country ? `/search?country=${encodeURIComponent(country)}` : '/search'} className={navLinkClass} onClick={() => setMenuOpen(false)}>Search</NavLink>
            </div>
            <div className="flex gap-5 border-t border-line pt-3">
              {user ? (
                <button type="button" onClick={() => { signOut(); setMenuOpen(false); }} className="text-sm font-semibold text-ink">Sign out</button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-ink">Sign in</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-accent">Register</Link>
                </>
              )}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto min-h-[65vh] max-w-[1440px] px-4 py-8 sm:px-7 sm:py-10">
        <Outlet />
      </main>

      <div className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-4 py-3 text-xs text-muted sm:px-7">
          <span className={`size-2 rounded-full ${health.isSuccess ? 'bg-emerald-600' : health.isError ? 'bg-red-600' : 'bg-amber-500'}`} aria-hidden="true" />
          <span role="status" aria-label="Backend API status">
            {health.isSuccess ? 'News service online' : health.isError ? 'News service unavailable' : 'Checking news service'}
          </span>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
