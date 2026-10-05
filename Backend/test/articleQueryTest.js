
const assert = require('node:assert/strict');
const { test } = require('node:test');

const Article = require('../src/models/Article');
const { getArticles } = require('../src/controllers/articleController');

async function runQueryTest(queryParams, expectedQuery, expectedPage, expectedLimit) {
  const originalCountDocuments = Article.countDocuments;
  const originalFind = Article.find;

  const articles = [
    { title: 'Test Article 1' },
    { title: 'Test Article 2' },
  ];

  let receivedQuery;
  let receivedSkip;
  let receivedLimit;

  try {
    Article.countDocuments = async (query) => {
      receivedQuery = query;
      return 25;
    };

    Article.find = (query) => {
      receivedQuery = query;

      const chain = {
        sort() {
          return this;
        },
        skip(value) {
          receivedSkip = value;
          return this;
        },
        limit(value) {
          receivedLimit = value;
          return Promise.resolve(articles);
        },
      };

      return chain;
    };

    const req = { query: queryParams };

    const res = {
      statusCode: null,
      body: null,

      status(code) {
        this.statusCode = code;
        return this;
      },

      json(data) {
        this.body = data;
        return this;
      },
    };

    let nextError = null;

    await getArticles(req, res, (error) => {
      nextError = error;
    });

    assert.equal(nextError, null);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(receivedQuery, expectedQuery);
    assert.equal(receivedSkip, (expectedPage - 1) * expectedLimit);
    assert.equal(receivedLimit, expectedLimit);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.articles.length, 2);
    assert.equal(res.body.data.pagination.page, expectedPage);
    assert.equal(res.body.data.pagination.limit, expectedLimit);
    assert.equal(res.body.data.pagination.total, 25);
  } finally {
    Article.countDocuments = originalCountDocuments;
    Article.find = originalFind;
  }
}

test('searches articles by keyword', async () => {
  await runQueryTest(
    { search: 'technology' },
    { $text: { $search: 'technology' } },
    1,
    10
  );
});

test('filters articles by category', async () => {
  await runQueryTest(
    { category: 'sports' },
    { category: 'sports' },
    1,
    10
  );
});

test('combines search, category filtering and pagination', async () => {
  await runQueryTest(
    {
      search: 'football',
      category: 'sports',
      page: '2',
      limit: '5',
    },
    {
      $text: { $search: 'football' },
      category: 'sports',
    },
    2,
    5
  );
});
