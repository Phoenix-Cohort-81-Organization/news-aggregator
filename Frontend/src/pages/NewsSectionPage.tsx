import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CountrySelect } from '../components/news/CountrySelect';
import { NewsCard } from '../components/news/NewsCard';
import { ErrorState, EmptyState } from '../components/ui/Feedback';
import { NewsCardSkeleton } from '../components/ui/NewsCardSkeleton';
import { useNewsFilters, useNewsSection } from '../hooks/useNews';

export function NewsSectionPage() {
  const { section = 'news' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const country = searchParams.get('country') ?? '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const filters = useNewsFilters();
  const news = useNewsSection(section, country, page);
  const sectionMeta = filters.data?.sections.find((item) => item.slug === section);
  const label = sectionMeta?.label ?? section;
  const pagination = news.data?.pagination;
  const canGoPrevious = Boolean(pagination && pagination.page > 1);
  const canGoNext = Boolean(pagination && pagination.page < pagination.totalPages);

  useEffect(() => {
    document.title = `${label} — TheFeeds`;
  }, [label]);

  const updateParams = (nextCountry: string, nextPage = 1) => {
    const next = new URLSearchParams();
    if (nextCountry) next.set('country', nextCountry);
    if (nextPage > 1) next.set('page', String(nextPage));
    setSearchParams(next);
  };

  const pageLink = (nextPage: number) => {
    const next = new URLSearchParams();
    if (country) next.set('country', country);
    next.set('page', String(nextPage));
    return `?${next.toString()}`;
  };

  return (
    <section>
      <div className="mb-6 border-b-4 border-ink pb-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">TheFeeds / Section</p>
            <h1 className="mt-1 font-sans text-4xl font-bold tracking-tight sm:text-5xl">{label}</h1>
          </div>
          {filters.data && (
            <CountrySelect
              countries={filters.data.countries}
              value={country}
              onChange={(value) => updateParams(value)}
            />
          )}
        </div>
        {filters.data && (
          <nav className="scrollbar-none mt-5 flex gap-0 overflow-x-auto border-t border-line" aria-label="News categories">
            {filters.data.sections.map((item) => (
              <Link
                key={item.slug}
                to={`/news/${item.slug}${country ? `?country=${encodeURIComponent(country)}` : ''}`}
                aria-current={item.slug === section ? 'page' : undefined}
                className={`shrink-0 border-b-[3px] px-4 py-3 text-sm font-semibold transition-colors first:-ml-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent sm:first:ml-0 ${
                  item.slug === section
                    ? 'border-accent text-ink'
                    : 'border-transparent text-muted hover:border-line'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {sectionMeta?.mode === 'search' && (
        <p className="mb-5 border-l-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          This section uses a keyword search through the backend news search endpoint. The current API does not provide a dedicated audio, video, live, art, or travel category feed.
        </p>
      )}

      {news.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label={`Loading ${label} stories`}>
          <span className="sr-only">Loading stories</span>
          {Array.from({ length: 6 }, (_, index) => <NewsCardSkeleton key={index} />)}
        </div>
      ) : news.isError ? (
        <ErrorState
          title={`${label} is unavailable`}
          message={news.error.message}
          onRetry={() => void news.refetch()}
        />
      ) : news.data.articles.length === 0 ? (
        <EmptyState title={`No ${label} stories found`} message="Try another edition or check back later." />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between border-b border-line pb-2 text-sm text-muted">
            <span className="font-semibold text-ink">Latest {label}</span>
            <span>{news.data.articles.length} stories</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {news.data.articles.map((article) => <NewsCard key={article.url} article={article} />)}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-between border-y border-line py-4" aria-label="News pagination">
              {canGoPrevious ? (
                <Link
                  to={pageLink(pagination.page - 1)}
                  rel="prev"
                  className="inline-flex min-h-11 items-center gap-2 border border-line px-4 text-sm font-bold hover:border-ink hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span aria-hidden="true">←</span> Previous
                </Link>
              ) : (
                <span aria-disabled="true" className="inline-flex min-h-11 items-center gap-2 border border-line px-4 text-sm font-semibold text-muted/60">
                  <span aria-hidden="true">←</span> Previous
                </span>
              )}
              <span className="text-sm font-semibold text-muted" aria-live="polite">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              {canGoNext ? (
                <Link
                  to={pageLink(pagination.page + 1)}
                  rel="next"
                  className="inline-flex min-h-11 items-center gap-2 border border-line px-4 text-sm font-bold hover:border-ink hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Next <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <span aria-disabled="true" className="inline-flex min-h-11 items-center gap-2 border border-line px-4 text-sm font-semibold text-muted/60">
                  Next <span aria-hidden="true">→</span>
                </span>
              )}
            </nav>
          )}
        </>
      )}
    </section>
  );
}
