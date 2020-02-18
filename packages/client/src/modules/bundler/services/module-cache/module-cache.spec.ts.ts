import { ModuleCache } from './module-cache';

describe('ModuleCache', () => {
  /* eslint-disable @typescript-eslint/no-empty-function */
  const noop = (): void => {};

  it('get() and set() should get and set the cache value respectively', () => {
    const cache = new ModuleCache();

    expect(cache.get('some-key')).toBeFalsy();
    cache.set('some-key', { module: noop, deps: ['some-dep'] });
    expect(cache.get('some-key')).toEqual({ module: noop, deps: ['some-dep'] });
  });

  it('unset() should clear cache value', () => {
    const cache = new ModuleCache();

    cache.set('some-key', { module: noop, deps: ['some-other-dep'] });
    expect(cache.get('some-key')).toEqual({
      module: noop,
      deps: ['some-other-dep']
    });
    cache.unset('some-key');
    expect(cache.get('some-key')).toBe(null);
  });

  it('reset() should clear the cache', () => {
    const cache = new ModuleCache();

    cache.set('some-key', { module: noop, deps: ['some-fuck-dep'] });
    cache.set('some-other-key', { module: noop, deps: ['some-shit-dep'] });
    cache.reset();

    expect(cache.get('some-key')).toBe(null);
    expect(cache.get('some-other-key')).toBe(null);
  });
});
