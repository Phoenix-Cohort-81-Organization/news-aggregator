import { ArrowLeft, CalendarDays, ExternalLink, User } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState, ErrorState } from '../components/ui/Feedback';
import { useArticle } from '../hooks/useArticles';

export function ArticleEditorialViewPage() {
  const { id } = useParams<{ id: string }>();
  const { data: article, isPending, isError, error, refetch } = useArticle(id);

  useEffect(() => {
    document.title = article ? `${article.title} — TheFeeds` : 'Article — TheFeeds';
  }, [article]);

  if (isPending) {
    return (
      <section className="mx-auto max-w-3xl py-12" role="status" aria-label="Loading article">
        <div className="h-4 w-24 animate-pulse bg-wash" />
        <div className="mt-4 h-10 w-full animate-pulse bg-wash" />
        <div className="mt-3 h-10 w-2/3 animate-pulse bg-wash" />
        <div className="mt-8 h-64 w-full animate-pulse bg-wash" />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-2xl py-12">
        <ErrorState
          title="Unable to load article"
          message={error instanceof Error ? error.message : 'Please try again.'}
          onRetry={() => void refetch()}
        />
        <div className="mt-5 text-center">
          <Link to="/articles" className="text-sm font-semibold text-accent underline underline-offset-4">
            Back to articles
          </Link>
        </div>
      </section>
    );
  }

  if (!article) {
    return (
      <section className="mx-auto max-w-2xl py-12">
        <EmptyState title="Article not found" message="This article may have been removed." />
        <div className="mt-5 text-center">
          <Link to="/articles" className="text-sm font-semibold text-accent underline underline-offset-4">
            Back to articles
          </Link>
        </div>
      </section>
    );
  }

  const dateLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(article.publishedAt));

  return (
    <article className="mx-auto max-w-3xl py-8">
      <Link
        to="/articles"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Back to articles
      </Link>

      {article.category && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-accent">
          {article.category}
        </p>
      )}

      <h1 className="font-serif text-3xl leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
        {article.title}
      </h1>

      {article.description && (
        <p className="mt-5 border-l-2 border-accent pl-4 font-serif text-lg leading-relaxed text-muted">
          {article.description}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-line py-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <User size={13} aria-hidden="true" />
          {article.author || 'Editorial team'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={13} aria-hidden="true" />
          <time dateTime={article.publishedAt}>{dateLabel}</time>
        </span>
      </div>

      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt={`Illustration for: ${article.title}`}
          className="mt-8 aspect-[16/9] w-full bg-wash object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      )}

      <div className="mt-8 whitespace-pre-line font-serif text-lg leading-relaxed text-ink">
        {article.content || article.description || 'No content available.'}
      </div>

      {article.url && (
        <a
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className="mt-10 inline-flex items-center gap-2 border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Reference link <ExternalLink size={14} aria-hidden="true" />
        </a>
      )}
    </article>
  );
}