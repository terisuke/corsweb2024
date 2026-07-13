import test from 'node:test';
import assert from 'node:assert/strict';
import { computeSignature, resetNonces, verifySignature } from '../src/server.js';

test.beforeEach(() => resetNonces());

test('accepts a current correctly signed request once', () => {
  const now = 1_700_000_000_000;
  const input = { secret: 'test-secret', timestamp: String(now), nonce: 'unique', body: '{}' };
  const signature = computeSignature(input.secret, input.timestamp, input.nonce, input.body);
  assert.equal(verifySignature({ ...input, signature, now }), true);
  assert.equal(verifySignature({ ...input, signature, now }), false);
});

test('rejects stale or tampered requests', () => {
  const now = 1_700_000_000_000;
  const timestamp = String(now - 31_000);
  const signature = computeSignature('secret', timestamp, 'nonce', '{}');
  assert.equal(verifySignature({ secret: 'secret', timestamp, nonce: 'nonce', signature, body: '{}', now }), false);
  assert.equal(verifySignature({ secret: 'secret', timestamp: String(now), nonce: 'nonce2', signature, body: '{"x":1}', now }), false);
});
