import { ArrowLeft, ArrowUpRight, CalendarDays, Copy, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { EmptyState } from '../components/ui/Feedback';
import type { Article } from '../types/news';

const providerNames = {
  gnews: 'GNews',
  guardian: 'The Guardian',
} as const;

const isArticle = (value: unknown): value is Article => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;

  return typeof candidate.title === 'string'
    && typeof candidate.url === 'string'
    && typeof candidate.publishedAt === 'string'
    && (candidate.provider === 'gnews' || candidate.provider === 'guardian')
    && (candidate.description === null || typeof candidate.description === 'string')
    && (candidate.imageUrl === null || typeof candidate.imageUrl === 'string')
    && (candidate.author === null || typeof candidate.author === 'string')
    && (candidate.section === null || typeof candidate.section === 'string');
};

function ArticleDetailsContent({ article }: { article: Article }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const parsedDate = new Date(article.publishedAt);
  const dateLabel = Number.isNaN(parsedDate.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(parsedDate);
  const sourceName = providerNames[article.provider];

  useEffect(() => {
    document.title = `${article.title} — TheFeeds`;
  }, [article.title]);

  const shareOriginal = async () => {
    setShareMessage('');
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, url: article.url });
        setShareMessage('Article shared.');
      } else {
        await navigator.clipboard.writeText(article.url);
        setShareMessage('Original article link copied.');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setShareMessage('Unable to share the article from this browser.');
    }
  };

  return (
    <article className="-mx-5 -mt-10 sm:-mx-8 sm:-mt-14">
      <header className="bg-[#102236] px-5 pb-20 pt-10 text-white sm:px-8 sm:pb-28 sm:pt-14">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/search"
            className="mb-8 inline-flex items-center gap-2 text-sm text-white/75 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back to stories
          </Link>
          <div className="mx-auto max-w-3xl text-center">
            {article.section && (
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#efaa91]">
                {article.section}
              </p>
            )}
            <h1 className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>
            <p className="mt-5 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-white/75">
              <span>Originally reported by <strong className="font-semibold text-white">{sourceName}</strong></span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} aria-hidden="true" />
                <time dateTime={article.publishedAt}>{dateLabel}</time>
              </span>
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto -mt-12 max-w-6xl px-5 sm:-mt-16 sm:px-8">
        {article.imageUrl && !imageFailed ? (
          <img
            src={article.imageUrl}
            alt={`Illustration for: ${article.title}`}
            className="mx-auto aspect-[16/9] w-full max-w-4xl bg-wash object-cover"
            fetchPriority="high"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="mx-auto grid aspect-[16/9] w-full max-w-4xl place-items-center bg-wash text-sm font-medium tracking-wide text-muted">
            IMAGE UNAVAILABLE
          </div>
        )}
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,680px)_220px] lg:gap-8">
        <aside className="hidden lg:block" aria-label="Article actions">
          <div className="sticky top-8 flex flex-col items-center gap-5 border-r border-line pr-4 text-xs text-muted">
            <span className="text-center leading-4">Read the<br />original</span>
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="grid size-9 place-items-center rounded-full border border-line text-ink hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label={`Open original story from ${sourceName}`}
            >
              <ExternalLink size={16} aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => void shareOriginal()}
              className="grid size-9 place-items-center rounded-full border border-line text-ink hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label="Share the original article"
            >
              <Copy size={16} aria-hidden="true" />
            </button>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line pb-5 text-xs text-muted">
            <span className="font-semibold text-ink">{sourceName}</span>
            {article.provider === 'guardian' && article.author && (
              <>
                <span aria-hidden="true">·</span>
                <span>By {article.author}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <time dateTime={article.publishedAt}>{dateLabel}</time>
          </div>

          {article.description ? (
            <>
              <p className="mt-7 whitespace-pre-line font-serif text-xl leading-relaxed text-ink sm:text-2xl sm:leading-[1.7]">
                {article.description}
              </p>
              <p className="mt-5 border-l-2 border-accent pl-4 text-sm leading-6 text-muted">
                This is the summary provided by our news service. The complete article is available from its original publisher.
              </p>
            </>
          ) : (
            <p className="mt-7 text-base leading-7 text-muted">
              The news service did not provide an article summary. Visit the original publisher to read the available reporting.
            </p>
          )}

          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 bg-[#102236] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Continue to {sourceName} <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <p className="mt-3 text-xs text-muted">
            The full story is hosted by and credited to {sourceName}.
          </p>
          <div className="mt-8 lg:hidden">
            <button
              type="button"
              onClick={() => void shareOriginal()}
              className="inline-flex items-center gap-2 border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Copy size={15} aria-hidden="true" /> Share original link
            </button>
          </div>
          {shareMessage && (
            <p className="mt-3 text-sm text-muted" role="status">{shareMessage}</p>
          )}
        </div>

        <aside className="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0" aria-label="About the source">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Original source</p>
          <h2 className="mt-3 text-lg font-semibold text-ink">{sourceName}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            This story is reported and published by {sourceName}. TheFeeds links to the publisher and does not reproduce unavailable article text.
          </p>
          {article.section && (
            <p className="mt-5 border-t border-line pt-4 text-xs text-muted">
              Section <span className="font-medium text-ink">{article.section}</span>
            </p>
          )}
        </aside>
      </div>
    </article>
  );
}

export function ArticleDetailsPage() {
  const location = useLocation();
  const state: unknown = location.state;
  const article = state && typeof state === 'object' && 'article' in state
    ? (state as { article: unknown }).article
    : null;

  if (!isArticle(article)) {
    return (
      <section className="mx-auto max-w-2xl py-12">
        <EmptyState
          title="Open a story from your results"
          message="Article details are available after selecting a story from search. The backend does not yet provide a standalone article-detail endpoint."
        />
        <div className="mt-5 text-center">
          <Link
            to="/search"
            className="text-sm font-semibold text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Search stories
          </Link>
        </div>
      </section>
    );
  }

  return <ArticleDetailsContent article={article} />;
}
