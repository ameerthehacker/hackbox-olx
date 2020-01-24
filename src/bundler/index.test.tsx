import { transform } from '@babel/standalone';
import { babelPlugin, buildExecutableModule } from './index';
import { FileMetaData } from './file-meta-data';
import { getFileMetaData } from './utils';
import { FS } from './services/fs';

let someFileMetaData: FileMetaData;

describe('Babel plugin', () => {
  beforeEach(() => {
    someFileMetaData = getFileMetaData('./hello.js');
  });

  it('should remove the imports', () => {
    const filePath = './hello.js';
    const code = `import welcome from './welcome';
    welcome();
    `;
    const expectedTransformedCode = `welcome();`;

    const transformedCode = transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(someFileMetaData)]
    }).code;

    expect(transformedCode).toBe(expectedTransformedCode);
  });

  it('should update fileMetadata with deps', () => {
    const code = `import dep1 from './modules/dep1';
      import dep2 from './modules/dep2';
      dep1();
      dep2();
      `;

    transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(someFileMetaData)]
    });

    expect(someFileMetaData.deps).toEqual([
      getFileMetaData('./modules/dep1'),
      getFileMetaData('./modules/dep2')
    ]);
  });

  it('should return the exports as array', () => {
    const code = `const counter = 10;
    export default counter;`;

    transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(someFileMetaData)]
    });

    expect(someFileMetaData.exports).toEqual({ ___default: 'counter' });
  });

  it('should remove default exports', () => {
    const code = `const counter = 10;
    export default counter;`;

    const transformedCode = transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(someFileMetaData)]
    }).code;

    expect(transformedCode).toBe(`const counter = 10;`);
  });
});

describe('buildExecutableModule()', () => {
  it('should create the function with required dependencies', async () => {
    const files = {
      './hello.js': `console.log('hello from hackbox');`
    };
    const fs = new FS(files);
    const module = await buildExecutableModule(
      getFileMetaData('./hello.js'),
      fs
    );

    console.log = jest.fn();
    module();

    expect(console.log).toHaveBeenCalledWith('hello from hackbox');
  });

  it('should return the default export', async () => {
    const files = {
      './hello.js': `function hello() { console.log('hello from export'); }
      export default hello;`
    };
    const fs = new FS(files);
    const module = await buildExecutableModule(
      getFileMetaData('./hello.js'),
      fs
    );

    console.log = jest.fn();
    const exports = module();
    // try running the default export
    exports.___default();

    expect(console.log).toHaveBeenCalledWith('hello from export');
  });
});
