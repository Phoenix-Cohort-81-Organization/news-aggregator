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

  useEffect(() => {
    document.title = `${label} — TheFeeds`;
  }, [label]);

  const updateParams = (nextCountry: string, nextPage = 1) => {
    const next = new URLSearchParams();
    if (nextCountry) next.set('country', nextCountry);
    if (nextPage > 1) next.set('page', String(nextPage));
    setSearchParams(next);
  };

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">TheFeeds / Section</p>
          <h1 className="mt-1 font-serif text-3xl capitalize tracking-tight sm:text-4xl">{label}</h1>
        </div>
        {filters.data && (
          <CountrySelect
            countries={filters.data.countries}
            value={country}
            onChange={(value) => updateParams(value)}
          />
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
          <div className="mb-4 flex items-center justify-between text-sm text-muted">
            <span>{news.data.articles.length} stories</span>
            {news.data.pagination && <span>Page {news.data.pagination.page} of {news.data.pagination.totalPages}</span>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {news.data.articles.map((article) => <NewsCard key={article.url} article={article} />)}
          </div>
          {news.data.pagination && news.data.pagination.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-4" aria-label="News pagination">
              {page > 1 ? (
                <Link
                  to={`?${new URLSearchParams({ ...(country ? { country } : {}), page: String(page - 1) })}`}
                  className="border border-line px-4 py-2 text-sm font-semibold hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Previous
                </Link>
              ) : <span className="border border-line px-4 py-2 text-sm text-muted">Previous</span>}
              <span className="text-sm text-muted">Page {page}</span>
              {page < news.data.pagination.totalPages ? (
                <Link
                  to={`?${new URLSearchParams({ ...(country ? { country } : {}), page: String(page + 1) })}`}
                  className="border border-line px-4 py-2 text-sm font-semibold hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Next
                </Link>
              ) : <span className="border border-line px-4 py-2 text-sm text-muted">Next</span>}
            </nav>
          )}
        </>
      )}
    </section>
  );
}
