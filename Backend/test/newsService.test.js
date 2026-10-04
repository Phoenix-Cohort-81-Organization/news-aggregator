const assert = require('node:assert/strict');
const { after, test } = require('node:test');

process.env.GNEWS_API_KEY = 'test-gnews-key';
process.env.GUARDIAN_API_KEY = 'test-guardian-key';

const originalFetch = global.fetch;
const { getTopHeadlines, searchNews } = require('../src/services/newsService');
const app = require('../app');

after(() => {
  global.fetch = originalFetch;
});

test('normalizes, merges, and sorts articles from both providers', async () => {
  global.fetch = async (input) => {
    const url = new URL(input);
    if (url.hostname === 'gnews.io') {
      return {
        ok: true,
        json: async () => ({
          articles: [{
            title: 'GNews story',
            description: 'A GNews summary',
            url: 'https://example.com/gnews',
            image: 'https://example.com/gnews.jpg',
            publishedAt: '2026-09-30T10:00:00Z',
            source: { name: 'GNews Publisher' },
          }],
        }),
      };
    }

    return {
      ok: true,
      json: async () => ({
        response: {
          results: [{
            webTitle: 'Guardian story',
            webUrl: 'https://example.com/guardian',
            webPublicationDate: '2026-09-30T11:00:00Z',
            sectionName: 'World',
            fields: { trailText: 'A Guardian summary', thumbnail: 'https://example.com/guardian.jpg', byline: 'A. Reporter' },
          }],
        },
      }),
    };
  };

  const result = await searchNews({ query: 'climate', pageSize: 10 });

  assert.deepEqual(result.providers, { succeeded: ['gnews', 'guardian'], failed: [] });
  assert.equal(result.articles.length, 2);
  assert.equal(result.articles[0].provider, 'guardian');
  assert.equal(result.articles[1].author, 'GNews Publisher');
});

test('returns available provider results when the other provider fails', async () => {
  global.fetch = async (input) => {
    const url = new URL(input);
    if (url.hostname === 'gnews.io') {
      return {
        ok: true,
        json: async () => ({ articles: [{ title: 'Available story', url: 'https://example.com/story', publishedAt: '2026-09-30T10:00:00Z' }] }),
      };
    }
    return { ok: false, status: 503 };
  };

  const result = await searchNews({ query: 'climate', pageSize: 10 });

  assert.deepEqual(result.providers, { succeeded: ['gnews'], failed: ['guardian'] });
  assert.equal(result.articles.length, 1);
});

test('requests category headlines with country and pagination and returns metadata', async () => {
  let requestedUrl;
  global.fetch = async (input) => {
    requestedUrl = new URL(input);
    return {
      ok: true,
      json: async () => ({
        totalArticles: 23,
        articles: [{
          title: 'World headline',
          description: 'A verified headline summary',
          url: 'https://example.com/headline',
          image: 'https://example.com/headline.jpg',
          publishedAt: '2026-09-30T10:00:00Z',
          source: { name: 'Publisher' },
        }],
      }),
    };
  };

  const result = await getTopHeadlines({
    category: 'business',
    country: 'gb',
    page: 2,
    pageSize: 10,
  });

  assert.equal(requestedUrl.pathname, '/api/v4/top-headlines');
  assert.equal(requestedUrl.searchParams.get('category'), 'business');
  assert.equal(requestedUrl.searchParams.get('country'), 'gb');
  assert.equal(requestedUrl.searchParams.get('page'), '2');
  assert.equal(requestedUrl.searchParams.get('max'), '10');
  assert.equal(result.articles[0].provider, 'gnews');
  assert.deepEqual(result.pagination, {
    page: 2,
    pageSize: 10,
    totalArticles: 23,
    totalPages: 3,
  });
});

test('does not send a country-filtered search to Guardian without country support', async () => {
  const requestedHosts = [];
  global.fetch = async (input) => {
    const url = new URL(input);
    requestedHosts.push(url.hostname);
    return {
      ok: true,
      json: async () => ({ articles: [] }),
    };
  };

  const result = await searchNews({
    query: 'climate',
    pageSize: 10,
    country: 'gb',
  });

  assert.deepEqual(requestedHosts, ['gnews.io']);
  assert.deepEqual(result.providers, { succeeded: ['gnews'], failed: [] });
});

test('exposes health, country/category filters, and country validation over the API', async (context) => {
  const mockedFetch = global.fetch;
  const providerRequests = [];
  global.fetch = async (input) => {
    const url = new URL(input);
    providerRequests.push(url);
    return {
      ok: true,
      json: async () => ({
        totalArticles: 21,
        articles: [{
          title: 'API route story',
          description: 'Story summary',
          url: 'https://example.com/api-route',
          image: null,
          publishedAt: '2026-09-30T10:00:00Z',
          source: { name: 'Publisher' },
        }],
      }),
    };
  };
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  context.after(async () => {
    global.fetch = mockedFetch;
    const closed = new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    server.closeAllConnections();
    await closed;
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  const healthResponse = await originalFetch(`${baseUrl}/health`);
  assert.equal(healthResponse.status, 200);
  assert.equal((await healthResponse.json()).success, true);

  const filtersResponse = await originalFetch(`${baseUrl}/news/filters`);
  const filters = await filtersResponse.json();
  assert.equal(filtersResponse.status, 200);
  assert.equal(filters.data.sections.length, 12);
  assert.equal(filters.data.countries.find(({ code }) => code === 'gb').name, 'United Kingdom');
  assert.ok(filters.data.gnewsCategories.includes('sports'));

  const invalidCountryResponse = await originalFetch(`${baseUrl}/news/headlines?country=xx`);
  assert.equal(invalidCountryResponse.status, 400);
  assert.equal((await invalidCountryResponse.json()).message, 'Unsupported GNews country code');

  const headlinesResponse = await originalFetch(
    `${baseUrl}/news/headlines?category=business&country=gb&page=2&pageSize=10`,
  );
  const headlines = await headlinesResponse.json();
  assert.equal(headlinesResponse.status, 200);
  assert.equal(headlines.data.pagination.totalPages, 3);
  assert.equal(providerRequests[0].searchParams.get('category'), 'business');
  assert.equal(providerRequests[0].searchParams.get('country'), 'gb');
  assert.equal(providerRequests[0].searchParams.get('page'), '2');

  const sectionResponse = await originalFetch(`${baseUrl}/news/sections/art?country=gb`);
  const section = await sectionResponse.json();
  assert.equal(sectionResponse.status, 200);
  assert.equal(section.data.section.mode, 'search');
  assert.equal(providerRequests[1].searchParams.get('q'), 'art news');
  assert.equal(providerRequests[1].searchParams.get('country'), 'gb');
});

test('passes search pagination to GNews', async () => {
  let requestedUrl;

  global.fetch = async (input) => {
    requestedUrl = new URL(input);

    return {
      ok: true,
      json: async () => ({
        articles: [],
      }),
    };
  };

  await searchNews({
    query: 'technology',
    pageSize: 5,
    page: 2,
    country: 'us',
  });

  assert.equal(requestedUrl.searchParams.get('page'), '2');
  assert.equal(requestedUrl.searchParams.get('max'), '5');
  assert.equal(requestedUrl.searchParams.get('country'), 'us');
});