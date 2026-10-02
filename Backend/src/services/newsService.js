const env = require('../config/env');

const GNEWS_URL = 'https://gnews.io/api/v4/search';
const GNEWS_HEADLINES_URL = 'https://gnews.io/api/v4/top-headlines';
const GUARDIAN_URL = 'https://content.guardianapis.com/search';
const REQUEST_TIMEOUT_MS = 8000;
const GNEWS_CATEGORIES = new Set([
  'general',
  'world',
  'nation',
  'business',
  'technology',
  'entertainment',
  'sports',
  'science',
  'health',
]);

const requestJson = async (url) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`News provider returned HTTP ${response.status}`);
  }
  return response.json();
};

const normalizeGNewsArticle = (article) => ({
  title: article.title,
  description: article.description || null,
  url: article.url,
  imageUrl: article.image || null,
  publishedAt: article.publishedAt,
  author: article.source?.name || null,
  section: null,
  provider: 'gnews',
});

const searchGNews = async ({ query, pageSize, from, to, country, page }) => {
  const params = new URLSearchParams({ q: query, max: String(pageSize), apikey: env.gnews.apiKey });
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (country) params.set('country', country);
  if (page) params.set('page', String(page));

  const payload = await requestJson(`${GNEWS_URL}?${params}`);
  return payload.articles.map(normalizeGNewsArticle);
};

const searchGuardian = async ({ query, pageSize, from, to }) => {
  const params = new URLSearchParams({
    q: query,
    'page-size': String(pageSize),
    'show-fields': 'trailText,thumbnail,byline',
    'api-key': env.guardian.apiKey,
  });
  if (from) params.set('from-date', from);
  if (to) params.set('to-date', to);

  const payload = await requestJson(`${GUARDIAN_URL}?${params}`);
  return payload.response.results.map((article) => ({
    title: article.webTitle,
    description: article.fields?.trailText || null,
    url: article.webUrl,
    imageUrl: article.fields?.thumbnail || null,
    publishedAt: article.webPublicationDate,
    author: article.fields?.byline || null,
    section: article.sectionName || null,
    provider: 'guardian',
  }));
};

const searchNews = async (options) => {
  const providers = [];
  if (env.gnews.apiKey) providers.push(['gnews', searchGNews]);
  if (env.guardian.apiKey && !options.country) providers.push(['guardian', searchGuardian]);

  if (providers.length === 0) {
    const error = new Error('Configure GNEWS_API_KEY or GUARDIAN_API_KEY to search news');
    error.statusCode = 503;
    throw error;
  }

  const results = await Promise.allSettled(
    providers.map(([, search]) => search(options)),
  );
  const articles = [];
  const succeeded = [];
  const failed = [];

  results.forEach((result, index) => {
    const [provider] = providers[index];
    if (result.status === 'fulfilled') {
      succeeded.push(provider);
      articles.push(...result.value);
    } else {
      failed.push(provider);
      console.error(`${provider} search failed`);
    }
  });

  if (succeeded.length === 0) {
    const error = new Error('All configured news providers are unavailable');
    error.statusCode = 502;
    throw error;
  }

  const uniqueArticles = [...new Map(articles.map((article) => [article.url, article])).values()];
  uniqueArticles.sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));

  return {
    articles: uniqueArticles,
    providers: { succeeded, failed },
  };
};

const getTopHeadlines = async ({ category, country, pageSize, page }) => {
  if (!env.gnews.apiKey) {
    const error = new Error('Configure GNEWS_API_KEY to load category headlines');
    error.statusCode = 503;
    throw error;
  }

  if (!GNEWS_CATEGORIES.has(category)) {
    const error = new Error('Unsupported GNews top-headlines category');
    error.statusCode = 400;
    throw error;
  }

  const params = new URLSearchParams({
    category,
    max: String(pageSize),
    page: String(page),
    apikey: env.gnews.apiKey,
  });
  if (country) params.set('country', country);

  const payload = await requestJson(`${GNEWS_HEADLINES_URL}?${params}`);
  const articles = (payload.articles || []).map((article) => ({
    ...normalizeGNewsArticle(article),
    section: category,
  }));

  return {
    articles,
    providers: { succeeded: ['gnews'], failed: [] },
    pagination: {
      page,
      pageSize,
      totalArticles: Number(payload.totalArticles) || articles.length,
      totalPages: Math.min(
        Math.ceil((Number(payload.totalArticles) || articles.length) / pageSize),
        Math.ceil(1000 / pageSize),
      ),
    },
  };
};

module.exports = { getTopHeadlines, searchNews };