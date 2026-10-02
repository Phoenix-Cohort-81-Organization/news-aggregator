import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Music2,
  Youtube,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import logoMark from '../../assets/thefeeds-mark.svg';
import { useNewsFilters } from '../../hooks/useNews';

const primaryLinks = [
  { label: 'Home', to: '/' },
  { label: 'News', to: '/news/news' },
  { label: 'Sport', to: '/news/sport' },
  { label: 'Business', to: '/news/business' },
  { label: 'Technology', to: '/news/technology' },
  { label: 'Health', to: '/news/health' },
  { label: 'Culture', to: '/news/culture' },
  { label: 'Arts', to: '/news/art' },
  { label: 'Travel', to: '/news/travel' },
  { label: 'Earth', to: '/news/earth' },
  { label: 'Audio', to: '/news/audio' },
  { label: 'Video', to: '/news/video' },
  { label: 'Live', to: '/news/live' },
  { label: 'Weather', to: '/search?q=weather' },
  { label: 'TheFeeds Shop', unavailable: true },
  { label: 'TheFeeds Watch', to: '/news/video' },
] as const;

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/', Icon: Instagram },
  { label: 'Facebook', href: 'https://www.facebook.com/', Icon: Facebook },
  { label: 'YouTube', href: 'https://www.youtube.com/', Icon: Youtube },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/', Icon: Linkedin },
  { label: 'TikTok', href: 'https://www.tiktok.com/', Icon: Music2 },
  { label: 'Threads', href: 'https://www.threads.net/', Icon: MessageCircle },
] as const;

const informationLinks = [
  'Terms of Use',
  'About TheFeeds',
  'Privacy Policy',
  'Cookies',
  'Do not share or sell my info',
  'Accessibility Help',
  'Contact TheFeeds',
  'Advertise with us',
  'TheFeeds Help & FAQs',
  'Content Index',
  'Set Preferred Source',
] as const;

const linkClass =
  'text-sm text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white';

export function SiteFooter() {
  const filters = useNewsFilters();
  const countries = filters.data?.countries ?? [];

  return (
    <footer id="site-footer" className="bg-[#111820] text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-9 sm:px-7 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-5 border-b border-white/20 pb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-xl font-bold tracking-tight text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            aria-label="TheFeeds home"
          >
            <img src={logoMark} alt="" className="size-10" />
            <span>TheFeeds</span>
          </Link>
          <p className="max-w-xl text-sm leading-6 text-white/70">
            Independent stories from around the world, with every report linked to its original publisher.
          </p>
        </div>

        <nav className="border-b border-white/20 py-7" aria-label="Footer navigation">
          <h2 className="mb-4 text-lg font-bold text-white">Explore TheFeeds</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {primaryLinks.map((item) => (
              <li key={item.label}>
                {'to' in item ? (
                  <Link className={linkClass} to={item.to}>{item.label}</Link>
                ) : (
                  <span
                    className="text-sm text-white/45"
                    title="TheFeeds does not have a shop yet."
                    aria-label={`${item.label}; not currently available`}
                  >
                    {item.label} <span className="text-xs">(not available)</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid gap-8 border-b border-white/20 py-7 md:grid-cols-2">
          <section aria-labelledby="editions-heading">
            <h2 id="editions-heading" className="text-base font-bold text-white">
              TheFeeds in other languages
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
              Choose a country edition for locally focused headlines. Language-specific feeds aren’t currently provided by the backend.
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {countries.slice(0, 12).map((country) => (
                <li key={country.code}>
                  <Link
                    className={linkClass}
                    to={`/news/news?country=${encodeURIComponent(country.code)}`}
                    lang="en"
                  >
                    {country.name}
                  </Link>
                </li>
              ))}
              {countries.length === 0 && (
                <li className="text-sm text-white/55" role="status">
                  Country editions are temporarily unavailable.
                </li>
              )}
            </ul>
          </section>

          <section aria-labelledby="social-heading">
            <h2 id="social-heading" className="text-base font-bold text-white">
              Follow TheFeeds on:
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Social account links haven’t been configured yet. These links open the platform websites.
            </p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${label} platform website (opens in a new tab)`}
                    className="inline-flex min-h-11 items-center gap-2 border border-white/30 px-3 text-sm font-medium text-white/85 transition-colors hover:border-white hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <Icon size={17} aria-hidden="true" />
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <nav className="border-b border-white/20 py-7" aria-label="Legal and information">
          <h2 className="mb-4 text-base font-bold text-white">Information</h2>
          <ul className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
            {informationLinks.map((label) => (
              <li key={label}>
                <span
                  className="text-sm text-white/55"
                  title="TheFeeds has not configured a destination for this page yet."
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-5 text-white/50">
            TheFeeds’ policy, support, and contact pages will be linked here once their destinations are published.
          </p>
        </nav>

        <div className="pt-6 text-xs leading-6 text-white/65">
          <p className="font-semibold text-white">Copyright © 2026 TheFeeds. All rights reserved.</p>
          <p id="external-linking" className="mt-1">TheFeeds is not responsible for the content of external sites.</p>
          <p>
            <a
              href="#external-linking"
              className="underline underline-offset-2 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Read about our approach to external linking.
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
