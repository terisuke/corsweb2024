import { describe, expect, it } from 'vitest';
import { decryptText, encryptText, newSessionId, normalizeIdempotencyKey, queueMessage } from '../storage';

describe('encrypted contact storage primitives', () => {
  it('encrypts and decrypts PII without retaining plaintext', async () => {
    const encoded = await encryptText('test-encryption-secret', '山田太郎 <user@example.com>');
    expect(encoded).not.toContain('山田太郎');
    expect(encoded).not.toContain('user@example.com');
    await expect(decryptText('test-encryption-secret', encoded)).resolves.toBe('山田太郎 <user@example.com>');
    await expect(decryptText('wrong-secret', encoded)).rejects.toThrow();
  });

  it('keeps identifiers opaque and queue payload PII-free', () => {
    const sessionId = newSessionId();
    expect(sessionId).toMatch(/^[0-9a-f-]{36}$/);
    expect(normalizeIdempotencyKey('client-key-123')).toBe('client-key-123');
    expect(queueMessage('submission-id')).toEqual({ submissionId: 'submission-id' });
  });
});
