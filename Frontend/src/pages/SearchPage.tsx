import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CountrySelect } from '../components/news/CountrySelect';
import { useNewsSearch } from '../hooks/useNewsSearch';
import { useNewsFilters } from '../hooks/useNews';
import { NewsCard } from '../components/news/NewsCard';
import { ErrorState, EmptyState } from '../components/ui/Feedback';
import { NewsCardSkeleton } from '../components/ui/NewsCardSkeleton';
import type { NewsSearchParams } from '../types/news';

const parseSearchParams = (searchParams: URLSearchParams): NewsSearchParams | null => {
  const q = searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return null;

  const params: NewsSearchParams = { q, pageSize: 10 };
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const country = searchParams.get('country');
  if (from) params.from = from;
  if (to) params.to = to;
  if (country) params.country = country;
  return params;
};

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(() => parseSearchParams(searchParams), [searchParams]);
  const query = useNewsSearch(params);
  const filters = useNewsFilters();
  const [draftQuery, setDraftQuery] = useState(params?.q ?? '');
  const [from, setFrom] = useState(searchParams.get('from') ?? '');
  const [to, setTo] = useState(searchParams.get('to') ?? '');
  const providerFailures = query.data?.providers.failed ?? [];

  useEffect(() => {
    document.title = params ? `Search: ${params.q} — TheFeeds` : 'Search — TheFeeds';
  }, [params]);

  useEffect(() => {
    setDraftQuery(params?.q ?? '');
    setFrom(searchParams.get('from') ?? '');
    setTo(searchParams.get('to') ?? '');
  }, [params, searchParams]);

  const applySearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = draftQuery.trim();
    if (q.length < 2) return;
    const next = new URLSearchParams(searchParams);
    next.set('q', q);
    if (from) next.set('from', from);
    else next.delete('from');
    if (to) next.set('to', to);
    else next.delete('to');
    setSearchParams(next);
  };

  return (
    <section>
      <div className="mb-8 border-b border-line pb-6 sm:mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">News search</p>
        <h1 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">
          {params ? <>Results for <span className="italic">“{params.q}”</span></> : 'Search stories'}
        </h1>
        {query.data && (
          <p className="mt-3 text-sm text-muted">
            {query.data.articles.length} {query.data.articles.length === 1 ? 'story' : 'stories'} found
          </p>
        )}
      </div>

      <form className="mb-7 border border-line bg-paper p-4 sm:p-5" onSubmit={applySearch}>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-end">
          <div>
            <label htmlFor="search-query" className="mb-1.5 block text-sm font-semibold text-ink">Keywords</label>
            <input
              id="search-query"
              type="search"
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.currentTarget.value)}
              minLength={2}
              required
              className="w-full border border-line bg-white px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              placeholder="Search news"
            />
          </div>
          <div>
            <label htmlFor="date-from" className="mb-1.5 block text-sm font-semibold text-ink">From</label>
            <input id="date-from" type="date" value={from} onChange={(event) => setFrom(event.currentTarget.value)} className="w-full border border-line bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" />
          </div>
          <div>
            <label htmlFor="date-to" className="mb-1.5 block text-sm font-semibold text-ink">To</label>
            <input id="date-to" type="date" value={to} onChange={(event) => setTo(event.currentTarget.value)} className="w-full border border-line bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" />
          </div>
          <button type="submit" className="bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Apply filters</button>
        </div>
        {filters.data && (
          <div className="mt-4 border-t border-line pt-4">
            <CountrySelect
              countries={filters.data.countries}
              value={params?.country ?? ''}
              onChange={(country) => {
                const next = new URLSearchParams(searchParams);
                if (country) next.set('country', country);
                else next.delete('country');
                setSearchParams(next);
              }}
            />
          </div>
        )}
      </form>
      {params?.country && (
        <p className="mb-5 text-sm text-muted">
          Country editions are provided by GNews. The Guardian search endpoint does not support country filtering, so only the country-filtered provider is included.
        </p>
      )}

      {providerFailures.length > 0 && (
        <p className="mb-6 border-l-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="status">
          Some news providers could not be reached. Results may be incomplete.
        </p>
      )}

      {!params ? (
        <EmptyState
          title="Start with a search"
          message="Enter at least two characters above to find current reporting."
        />
      ) : query.isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading stories">
          <span className="sr-only">Loading news stories</span>
          {Array.from({ length: 6 }, (_, index) => <NewsCardSkeleton key={index} />)}
        </div>
      ) : query.isError ? (
        <ErrorState
          title="We couldn’t load those stories"
          message={query.error.message}
          onRetry={() => void query.refetch()}
        />
      ) : query.data.articles.length === 0 ? (
        <EmptyState
          title="No stories found"
          message="Try a broader search term or check back later."
        />
      ) : (
        <>
          {query.isFetching && (
            <p className="mb-4 text-sm text-muted" role="status">Updating results…</p>
          )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {query.data.articles.map((article) => (
              <NewsCard key={article.url} article={article} />
            ))}
          </div>
          <div className="mt-7 text-center">
            <Link to="/" className="text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Back to today’s headlines</Link>
          </div>
        </>
      )}
    </section>
  );
}
