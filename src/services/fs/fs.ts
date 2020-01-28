import { Volume } from 'memfs';

export class FS {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  private vol: any = null;

  constructor(files: Record<string, string> = {}) {
    this.vol = Volume.fromJSON(files);
  }

  isDirectory(path: string): boolean {
    return this.vol.lstatSync(path).isDirectory();
  }

  readDir(path: string): string[] {
    return this.vol.readdirSync(path);
  }

  importFromJSON(files: Record<string, string>): void {
    this.vol.fromJSON(files);
  }

  exportToJSON(): Record<string, string> {
    return this.vol.toJSON();
  }

  getBasePath(path: string): string {
    if (!this.isDirectory(path)) {
      const pathArr = path.split('/');

      pathArr.pop();

      return pathArr.join('/');
    } else {
      return path;
    }
  }

  async mkdir(dirname: string): Promise<void> {
    return await this.vol.mkdirSync(dirname);
  }

  async createFile(filename: string): Promise<void> {
    if (await this.vol.existsSync(filename)) {
      throw new Error(`file already exists`);
    }

    return await this.vol.writeFileSync(filename, '');
  }

  async readFile(filePath: string): Promise<string> {
    return await this.vol.readFileSync(filePath).toString('utf-8');
  }
}
