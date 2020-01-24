import { transform } from '@babel/standalone';
import { babelPlugin } from './index';
import { FileMetaData } from './file-meta-data';
import { getFileMetaData } from './utils';

describe('Babel plugin', () => {
  it('should remove the imports', () => {
    const code = `import welcome from './welcome';
    welcome();
    `;
    const expectedTransformedCode = `welcome();`;

    const transformedCode = transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin([])]
    }).code;

    expect(transformedCode).toBe(expectedTransformedCode);
  });

  it('should return the deps as array', () => {
    const code = `import dep1 from './modules/dep1';
      import dep2 from './modules/dep2';
      dep1();
      dep2();
      `;
    const deps: FileMetaData[] = [];

    transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(deps)]
    });

    expect(deps).toEqual([
      getFileMetaData('./modules/dep1'),
      getFileMetaData('./modules/dep2')
    ]);
  });
});
