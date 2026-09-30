const env = require('../config/env');

const GNEWS_URL = 'https://gnews.io/api/v4/search';
const GUARDIAN_URL = 'https://content.guardianapis.com/search';
const REQUEST_TIMEOUT_MS = 8000;

const requestJson = async (url) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`News provider returned HTTP ${response.status}`);
  }
  return response.json();
};

const searchGNews = async ({ query, pageSize, from, to }) => {
  const params = new URLSearchParams({ q: query, max: String(pageSize), apikey: env.gnews.apiKey });
  if (from) params.set('from', from);
  if (to) params.set('to', to);

  const payload = await requestJson(`${GNEWS_URL}?${params}`);
  return payload.articles.map((article) => ({
    title: article.title,
    description: article.description,
    url: article.url,
    imageUrl: article.image,
    publishedAt: article.publishedAt,
    author: article.source?.name || null,
    section: null,
    provider: 'gnews',
  }));
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
  if (env.guardian.apiKey) providers.push(['guardian', searchGuardian]);

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

module.exports = { searchNews };