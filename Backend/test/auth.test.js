const assert = require('node:assert/strict');
const request = require('supertest');
const { test } = require('node:test');
const app = require('../app');

test('registration rejects a missing password', async () => {
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Test User',
      email: 'test@example.com',
    });

  assert.equal(response.status, 400);
});

test('registration rejects a missing email', async () => {
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Test User',
      password: '123456',
    });

  assert.equal(response.status, 400);
});
