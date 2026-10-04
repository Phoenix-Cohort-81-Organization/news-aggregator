const assert = require('node:assert/strict');
const { test } = require('node:test');
const jwt = require('jsonwebtoken');

const { authenticate } = require('./authMiddleware');
const env = require('../config/env');

function createResponse() {
  return {
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
}

test('authenticate rejects a request without a token', () => {
  const req = {
    headers: {},
  };

  const res = createResponse();
  let nextCalled = false;

  authenticate(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, 'Authentication required');
  assert.equal(nextCalled, false);
});

test('authenticate rejects an invalid token', () => {
  const req = {
    headers: {
      authorization: 'Bearer invalid-token',
    },
  };

  const res = createResponse();
  let nextCalled = false;

  authenticate(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, 'Invalid or expired token');
  assert.equal(nextCalled, false);
});

test('authenticate accepts a valid token', () => {
  const token = jwt.sign(
    {
      userId: 'test-user-id',
      role: 'user',
    },
    env.jwt.secret,
    {
      expiresIn: '1d',
    }
  );

  const req = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };

  const res = createResponse();
  let nextCalled = false;

  authenticate(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.userId, 'test-user-id');
  assert.equal(req.user.role, 'user');
});