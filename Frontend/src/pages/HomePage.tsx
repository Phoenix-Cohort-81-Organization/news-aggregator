import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Globe2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CountrySelect } from '../components/news/CountrySelect';
import { FeaturedNewsCard } from '../components/news/FeaturedNewsCard';
import { NewsCard } from '../components/news/NewsCard';
import { ErrorState, EmptyState } from '../components/ui/Feedback';
import { NewsCardSkeleton } from '../components/ui/NewsCardSkeleton';
import { useNewsFilters, useTopHeadlines } from '../hooks/useNews';
import { searchSchema, type SearchFormValues } from '../schemas/search.schema';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const country = searchParams.get('country') ?? '';
  const filters = useNewsFilters();
  const news = useTopHeadlines('general', country);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
  });

  const onSubmit = (values: SearchFormValues) => {
    const query = new URLSearchParams({ q: values.q.trim() });
    if (country) query.set('country', country);
    navigate(`/search?${query.toString()}`);
  };

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">The world, in view</p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight sm:text-4xl">Today’s news</h1>
        </div>
        {filters.data && (
          <CountrySelect
            countries={filters.data.countries}
            value={country}
            onChange={(value) => {
              const next = new URLSearchParams(searchParams);
              if (value) next.set('country', value);
              else next.delete('country');
              setSearchParams(next);
            }}
          />
        )}
      </div>

      <form className="mb-7 max-w-2xl" onSubmit={handleSubmit(onSubmit)} role="search" noValidate>
        <label htmlFor="home-search" className="sr-only">Search news stories</label>
        <div className="flex border border-ink bg-white p-1 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
          <Search className="ml-3 self-center text-muted" size={18} aria-hidden="true" />
          <input
            id="home-search"
            {...register('q')}
            type="search"
            autoComplete="off"
            placeholder="Search today’s stories"
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted"
            aria-invalid={Boolean(errors.q)}
            aria-describedby={errors.q ? 'home-search-error' : undefined}
          />
          <button type="submit" className="inline-flex shrink-0 items-center gap-2 bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#941e25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            Search <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
        {errors.q && <p id="home-search-error" className="mt-2 text-sm text-red-700" role="alert">{errors.q.message}</p>}
      </form>

      {news.isPending ? (
        <div className="grid gap-4 md:grid-cols-2" role="status" aria-label="Loading headlines">
          <NewsCardSkeleton />
          <NewsCardSkeleton />
        </div>
      ) : news.isError ? (
        <ErrorState title="Today’s headlines are unavailable" message={news.error.message} onRetry={() => void news.refetch()} />
      ) : news.data.articles.length === 0 ? (
        <EmptyState title="No headlines yet" message="Try another country edition or check again soon." />
      ) : (
        <>
          <FeaturedNewsCard article={news.data.articles[0]} />
          {news.isFetching && <p className="mt-3 text-xs text-muted" role="status">Refreshing headlines…</p>}
          <section className="mt-8" aria-labelledby="latest-heading">
            <div className="mb-4 flex items-center justify-between border-b border-line pb-2">
              <h2 id="latest-heading" className="text-lg font-bold">More from the headlines</h2>
              <Link to={`/news/news${country ? `?country=${country}` : ''}`} className="text-sm font-semibold text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">All news</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {news.data.articles.slice(1, 7).map((article) => <NewsCard key={article.url} article={article} />)}
            </div>
          </section>
        </>
      )}

      <section className="mt-10 border-t border-line pt-6" aria-labelledby="sections-heading">
        <div className="mb-4 flex items-center gap-2">
          <Globe2 size={18} aria-hidden="true" className="text-accent" />
          <h2 id="sections-heading" className="text-lg font-bold">Explore the world</h2>
        </div>
        {filters.isError && <p className="mb-3 text-sm text-muted">Sections are temporarily unavailable. Try refreshing.</p>}
        <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-4">
          {(filters.data?.sections ?? [
            { slug: 'news', label: 'News' },
            { slug: 'sport', label: 'Sport' },
            { slug: 'business', label: 'Business' },
            { slug: 'technology', label: 'Technology' },
            { slug: 'health', label: 'Health' },
            { slug: 'culture', label: 'Culture' },
            { slug: 'art', label: 'Art' },
            { slug: 'travel', label: 'Travel' },
            { slug: 'earth', label: 'Earth' },
            { slug: 'audio', label: 'Audio' },
            { slug: 'video', label: 'Video' },
            { slug: 'live', label: 'Live' },
          ]).map((section) => (
            <Link
              key={section.slug}
              to={`/news/${section.slug}${country ? `?country=${country}` : ''}`}
              className="flex items-center justify-between bg-white px-4 py-4 text-sm font-semibold hover:bg-paper focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-accent"
            >
              {section.label}<ArrowRight size={15} className="text-accent" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
