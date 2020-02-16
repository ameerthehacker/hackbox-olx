import { ModuleDef } from '@hackbox/client/bundler';

export class ModuleCache {
  private static instance: ModuleCache;

  private constructor(
    private cache: { [key: string]: null | ModuleDef } = {}
  ) {}

  public static getInstance(): ModuleCache {
    if (this.instance == null) {
      this.instance = new ModuleCache();
    }

    return this.instance;
  }

  public set(key: string, value: ModuleDef): void {
    this.cache[key] = value;
  }

  public unset(key: string): void {
    this.cache[key] = null;
  }

  public get(key: string): ModuleDef | null {
    return this.cache[key];
  }

  public reset(): void {
    for (const key in this.cache) {
      this.cache[key] = null;
    }
  }
}
