export class CodeCache {
  private static instance: CodeCache;

  private constructor(
    private cache: { [key: string]: string | null | Function } = {}
  ) {}

  public static getInstance() {
    if (this.instance == null) {
      this.instance = new CodeCache();
    }

    return this.instance;
  }

  public set(key: string, value: string | Function) {
    this.cache[key] = value;
  }

  public unset(key: string) {
    this.cache[key] = null;
  }

  public get(key: string) {
    return this.cache[key];
  }
}
