import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-2xl py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">404 · Page not found</p>
      <h1 className="mt-4 font-serif text-4xl tracking-tight text-ink">This story has gone elsewhere.</h1>
      <p className="mt-4 text-muted">The page you requested doesn’t exist or may have moved.</p>
      <Link
        to="/"
        className="mt-8 inline-flex bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Back to TheFeeds
      </Link>
    </section>
  );
}
