import { ModuleDef } from '../module-def';

export class CodeCache {
  private static instance: CodeCache;

  private constructor(
    private cache: { [key: string]: null | ModuleDef } = {}
  ) {}

  public static getInstance(): CodeCache {
    if (this.instance == null) {
      this.instance = new CodeCache();
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
}
