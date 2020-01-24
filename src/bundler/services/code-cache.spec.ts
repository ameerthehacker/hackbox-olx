import { CodeCache } from './code-cache';

describe('CodeCache', () => {
  it('should be a sigleton', () => {
    const cache1 = CodeCache.getInstance();
    const cache2 = CodeCache.getInstance();

    expect(cache1).toBe(cache2);
  });

  it('get() and set() should get and set the cache value respectively', () => {
    const cache = CodeCache.getInstance();

    expect(cache.get('some-key')).toBeFalsy();
    cache.set('some-key', 'some-value');
    expect(cache.get('some-key')).toBe('some-value');
  });

  it('unset() should clear cache value', () => {
    const cache = CodeCache.getInstance();

    cache.set('some-key', 'some-value');
    expect(cache.get('some-key')).toBe('some-value');
    cache.unset('some-key');
    expect(cache.get('some-key')).toBe(null);
  });
});
