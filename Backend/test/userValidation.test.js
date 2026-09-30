const assert = require('node:assert/strict');
const { test } = require('node:test');
const User = require('../src/models/User');

test('rejects a password shorter than 6 characters', async () => {
  const user = new User({
    name: 'Test User',
    email: 'test@example.com',
    password: '12345',
  });

  await assert.rejects(
    user.validate(),
    /Password must be at least 6 characters/
  );
});

test('rejects an invalid email address', async () => {
  const user = new User({
    name: 'Test User',
    email: 'invalid-email',
    password: '123456',
  });

  await assert.rejects(
    user.validate(),
    /Please add a valid email/
  );
});

test('rejects a user without a name', async () => {
  const user = new User({
    email: 'test@example.com',
    password: '123456',
  });

  await assert.rejects(
    user.validate(),
    /Please add a name/
  );
});
