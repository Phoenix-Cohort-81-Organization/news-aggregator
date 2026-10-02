import { ArrowUpRight, Clock3 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../../types/news';

const providerNames = {
  gnews: 'GNews',
  guardian: 'The Guardian',
} as const;

interface NewsCardProps {
  article: Article;
}

export function NewsCard({ article }: NewsCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const publishedDate = new Date(article.publishedAt);
  const dateLabel = Number.isNaN(publishedDate.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(publishedDate);

  return (
    <article className="group flex h-full flex-col border border-line bg-white">
      {article.imageUrl && !imageFailed ? (
        <img
          src={article.imageUrl}
          alt=""
          loading="lazy"
          className="aspect-[16/9] w-full bg-wash object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="grid aspect-[16/9] w-full place-items-center bg-wash text-muted" aria-hidden="true">
          <span className="text-sm font-medium tracking-wide">IMAGE UNAVAILABLE</span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
          {article.section && <span>{article.section}</span>}
          {article.section && <span aria-hidden="true">·</span>}
          <span>{providerNames[article.provider]}</span>
        </div>
        <h2 className="text-lg font-semibold leading-snug tracking-tight text-ink sm:text-xl">
          <Link
            to="/article"
            state={{ article }}
            className="decoration-accent decoration-2 underline-offset-4 group-hover:underline focus-visible:underline focus-visible:outline-none"
          >
            {article.title}
          </Link>
        </h2>
        {article.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{article.description}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} aria-hidden="true" />
            <time dateTime={article.publishedAt}>{dateLabel}</time>
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-ink hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={`Read "${article.title}" at ${providerNames[article.provider]}`}
          >
            Original story <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}
