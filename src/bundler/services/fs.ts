import { Volume, fs } from 'memfs';

export class FS {
  private vol: any = null;

  constructor(files: Record<string, string> = {}) {
    this.vol = Volume.fromJSON(files);
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
