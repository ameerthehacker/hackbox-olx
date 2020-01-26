import { FS } from './fs';

describe('FS', () => {
  it('should read files', async () => {
    const files = {
      './modules/hello.js': `console.log('hello');`
    };
    const fs = new FS(files);

    expect(await fs.readFile('./modules/hello.js')).toEqual(
      `console.log('hello');`
    );
  });
});
