export class Cache<T> {
  constructor(private cache: { [key: string]: undefined | T } = {}) {}

  public set(key: string, value: T): void {
    this.cache[key] = value;
  }

  public unset(key: string): void {
    this.cache[key] = undefined;
  }

  public get(key: string): T | undefined {
    return this.cache[key];
  }

  public reset(): void {
    for (const key in this.cache) {
      this.cache[key] = undefined;
    }
  }
}
