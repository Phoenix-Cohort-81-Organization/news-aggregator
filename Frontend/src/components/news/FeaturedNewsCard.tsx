import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Article } from '../../types/news';

const providerNames = {
  gnews: 'GNews',
  guardian: 'The Guardian',
} as const;

export function FeaturedNewsCard({ article }: { article: Article }) {
  return (
    <article className="group grid overflow-hidden border border-line bg-[#111820] text-white md:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
      <Link
        to="/article"
        state={{ article }}
        className="relative block min-h-64 bg-[#27323c] focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white sm:min-h-80 md:min-h-[410px]"
        aria-label={`Read story: ${article.title}`}
      >
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-sm tracking-widest text-white/50">
            THEFEEDS
          </span>
        )}
        <span className="absolute left-4 top-4 bg-accent px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
          Top story
        </span>
      </Link>
      <div className="flex flex-col justify-center px-6 py-7 sm:px-8 md:px-9">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#f09b81]">
          {article.section || providerNames[article.provider]}
        </p>
        <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
          <Link
            to="/article"
            state={{ article }}
            className="hover:underline hover:decoration-accent hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            {article.title}
          </Link>
        </h2>
        {article.description && (
          <p className="mt-4 line-clamp-4 text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
            {article.description}
          </p>
        )}
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/20 pt-4">
          <span className="text-xs text-white/65">Reported by {providerNames[article.provider]}</span>
          <Link
            to="/article"
            state={{ article }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-[#f4b29d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Read story <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
