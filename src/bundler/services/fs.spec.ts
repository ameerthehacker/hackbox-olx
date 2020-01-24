import { FS } from './fs';

describe('FS', () => {
  it('should be singleton', () => {
    const fs1 = FS.getInstance();
    const fs2 = FS.getInstance();

    expect(fs1).toBe(fs2);
  });

  it('should import files as json and can read it', async () => {
    const fs = FS.getInstance();
    const files = {
      './modules/hello.js': `console.log('hello');`
    };

    fs.importFromJSON(files);

    expect(await fs.readFile('./modules/hello.js')).toEqual(
      `console.log('hello');`
    );
  });
});
