import { ModuleCache } from './module-cache';

describe('ModuleCache', () => {
  /* eslint-disable @typescript-eslint/no-empty-function */
  const noop = (): void => {};

  it('should be a sigleton', () => {
    const cache1 = ModuleCache.getInstance();
    const cache2 = ModuleCache.getInstance();

    expect(cache1).toBe(cache2);
  });

  it('get() and set() should get and set the cache value respectively', () => {
    const cache = ModuleCache.getInstance();

    expect(cache.get('some-key')).toBeFalsy();
    cache.set('some-key', { module: noop, deps: ['some-dep'] });
    expect(cache.get('some-key')).toEqual({ module: noop, deps: ['some-dep'] });
  });

  it('unset() should clear cache value', () => {
    const cache = ModuleCache.getInstance();

    cache.set('some-key', { module: noop, deps: ['some-other-dep'] });
    expect(cache.get('some-key')).toEqual({
      module: noop,
      deps: ['some-other-dep']
    });
    cache.unset('some-key');
    expect(cache.get('some-key')).toBe(null);
  });

  it('reset() should clear the cache', () => {
    const cache = ModuleCache.getInstance();

    cache.set('some-key', { module: noop, deps: ['some-fuck-dep'] });
    cache.set('some-other-key', { module: noop, deps: ['some-shit-dep'] });
    cache.reset();

    expect(cache.get('some-key')).toBe(null);
    expect(cache.get('some-other-key')).toBe(null);
  });
});
