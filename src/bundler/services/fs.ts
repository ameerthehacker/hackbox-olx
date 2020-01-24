import { Volume, fs } from 'memfs';

export class FS {
  private static fs: FS;
  private vol: any = null;

  private constructor() {
    this.vol = Volume.fromJSON({});
  }

  static getInstance() {
    if (this.fs == null) {
      this.fs = new FS();
    }

    return this.fs;
  }

  importFromJSON(files: Record<string, string>) {
    this.vol.fromJSON(files);
  }

  exportToJSON() {
    return this.vol.toJSON();
  }

  async readFile(filePath: string) {
    return await this.vol.readFileSync(filePath).toString('utf-8');
  }
}
