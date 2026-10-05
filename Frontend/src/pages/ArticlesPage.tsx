import { ArrowRight, FileText, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import { EmptyState, ErrorState } from '../components/ui/Feedback';
import { NewsCardSkeleton } from '../components/ui/NewsCardSkeleton';

const CATEGORIES = [
  'general', 'politics', 'business', 'technology', 'science',
  'health', 'sports', 'entertainment', 'world', 'culture',
  'lifestyle', 'travel', 'education', 'environment', 'opinion', 'other',
];

export function ArticlesPage() {
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = 'Editorial articles — TheFeeds';
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, category]);

  const { data, isPending, isError, error, refetch, isFetching } = useArticles({
    search: search || undefined,
    category: category || undefined,
    page,
    limit: 10,
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  return (
    <section>
      <div className="mb-6 border-b border-line pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Editorial</p>
        <h1 className="mt-1 font-serif text-3xl tracking-tight sm:text-4xl">Articles from our editors</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Original reporting and commentary written by TheFeeds editorial team.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mb-5 grid gap-3 sm:grid-cols-[1fr_200px_auto]" role="search">
        <label htmlFor="articles-search" className="sr-only">Search articles</label>
        <div className="flex border border-ink bg-white p-1 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
          <Search className="ml-3 self-center text-muted" size={18} aria-hidden="true" />
          <input
            id="articles-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, content…"
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-ink outline-none placeholder:text-muted"
          />
        </div>

        <label htmlFor="articles-category" className="sr-only">Filter by category</label>
        <select
          id="articles-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-line bg-white px-3 py-2.5 text-sm capitalize text-ink focus:border-ink focus:outline-2 focus:outline-offset-2 focus:outline-accent"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="capitalize">{c}</option>
          ))}
        </select>

        <button
          type="submit"
          className="bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#941e25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Search
        </button>
      </form>

      {isPending ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading articles">
          <NewsCardSkeleton />
          <NewsCardSkeleton />
          <NewsCardSkeleton />
        </div>
      ) : isError ? (
        <ErrorState
          title="Unable to load articles"
          message={error instanceof Error ? error.message : 'Please try again.'}
          onRetry={() => void refetch()}
        />
      ) : data.articles.length === 0 ? (
        <EmptyState
          title="No articles found"
          message={search || category
            ? 'Try a different search term or category.'
            : 'No editorial articles have been published yet.'}
        />
      ) : (
        <>
          {isFetching && <p className="mb-3 text-xs text-muted" role="status">Refreshing…</p>}
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.articles.map((article) => (
              <li key={article._id}>
                <Link
                  to={`/articles/${article._id}`}
                  className="group block h-full border border-line bg-white p-5 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {article.category && (
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-accent">
                      {article.category}
                    </p>
                  )}
                  <h2 className="font-serif text-xl leading-snug text-ink group-hover:text-accent">
                    {article.title}
                  </h2>
                  {article.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted">{article.description}</p>
                  )}
                  <p className="mt-4 flex items-center gap-2 text-xs text-muted">
                    <FileText size={13} aria-hidden="true" />
                    <time dateTime={article.publishedAt}>
                      {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(article.publishedAt))}
                    </time>
                    <ArrowRight size={13} className="ml-auto text-accent" aria-hidden="true" />
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {data.pagination.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Previous
              </button>
              <span className="text-sm text-muted">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page >= data.pagination.totalPages}
                className="border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}