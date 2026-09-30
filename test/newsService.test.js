const assert = require('node:assert/strict');
const { after, test } = require('node:test');

process.env.GNEWS_API_KEY = 'test-gnews-key';
process.env.GUARDIAN_API_KEY = 'test-guardian-key';

const originalFetch = global.fetch;
const { searchNews } = require('../src/services/newsService');

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