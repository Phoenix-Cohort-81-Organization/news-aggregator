const assert = require('node:assert/strict');
const request = require('supertest');
const { after, before, test } = require('node:test');
const mongoose = require('mongoose');

const app = require('../app');
const connectDB = require('../src/config/database');
const User = require('../src/models/User');
const Article = require('../src/models/article');

let editorToken;
let createdArticleId;

const uniqueEmail = () =>
  `article-test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

before(async () => {
  await connectDB();

  const email = uniqueEmail();

  await User.create({
    name: 'Article Test Editor',
    email,
    password: '123456',
    role: 'editor',
  });

  const loginResponse = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email,
      password: '123456',
    });

  assert.equal(loginResponse.status, 200);
  assert.ok(loginResponse.body.data.token);

  editorToken = loginResponse.body.data.token;
});

after(async () => {
  if (createdArticleId) {
    await Article.findByIdAndDelete(createdArticleId);
  }

  await mongoose.connection.close();
});

test('creates an article with an authenticated editor', async () => {
  const response = await request(app)
    .post('/api/v1/articles')
    .set('Authorization', `Bearer ${editorToken}`)
    .send({
      title: 'Test Article',
      description: 'Article created during CRUD testing',
      content: 'This is test article content.',
      url: `https://example.com/article-${Date.now()}`,
      imageUrl: 'https://example.com/image.jpg',
      author: 'Test Author',
      source: 'Test Source',
      category: 'technology',
      language: 'en',
      publishedAt: new Date().toISOString(),
      section: 'Technology',
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.message, 'Article created successfully');
  assert.ok(response.body.data.article);

  createdArticleId = response.body.data.article._id;

  assert.equal(response.body.data.article.title, 'Test Article');
});
