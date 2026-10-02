const assert = require('node:assert/strict');
const request = require('supertest');
const { test } = require('node:test');
const app = require('../app');

const uniqueEmail = () =>
  `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

test('login rejects a missing email', async () => {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({
      password: '123456',
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test('login rejects a missing password', async () => {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: uniqueEmail(),
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test('login rejects an unknown email', async () => {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: uniqueEmail(),
      password: '123456',
    });

  assert.equal(response.status, 401);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, 'Invalid credentials');
});