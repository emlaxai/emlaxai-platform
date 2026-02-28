import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit } from '@/lib/rate-limit';

describe('rateLimit', () => {
  const testKey = () => `test-${Date.now()}-${Math.random()}`;

  it('ilk istek izin verir', () => {
    const result = rateLimit(testKey(), { windowMs: 60000, maxRequests: 5 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('limit aşılınca engeller', () => {
    const key = testKey();
    const config = { windowMs: 60000, maxRequests: 3 };

    rateLimit(key, config);
    rateLimit(key, config);
    rateLimit(key, config);
    const result = rateLimit(key, config);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('remaining doğru azalır', () => {
    const key = testKey();
    const config = { windowMs: 60000, maxRequests: 5 };

    const r1 = rateLimit(key, config);
    const r2 = rateLimit(key, config);
    const r3 = rateLimit(key, config);

    expect(r1.remaining).toBe(4);
    expect(r2.remaining).toBe(3);
    expect(r3.remaining).toBe(2);
  });

  it('farklı keyler birbirini etkilemez', () => {
    const config = { windowMs: 60000, maxRequests: 1 };
    const key1 = testKey();
    const key2 = testKey();

    rateLimit(key1, config);
    const result = rateLimit(key2, config);

    expect(result.allowed).toBe(true);
  });

  it('varsayılan config ile çalışır', () => {
    const result = rateLimit(testKey());
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(29);
  });
});
