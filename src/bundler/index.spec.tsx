import { transform } from '@babel/standalone';
import { babelPlugin, buildExecutableModules, run } from './index';
import { FileMetaData } from './file-meta-data';
import { getFileMetaData } from './utils';
import { FS } from './services/fs';
import { CodeCache } from './services/code-cache';

let someFileMetaData: FileMetaData;

describe('Babel plugin', () => {
  beforeEach(() => {
    someFileMetaData = getFileMetaData('./hello.js');
    jest.resetAllMocks();
  });

  it('should update the default imports', () => {
    const code = `import welcome from './welcome';
    welcome();
    `;
    const expectedTransformedCode = `_WELCOME.___default();`;

    const transformedCode = transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(someFileMetaData)]
    }).code;

    expect(transformedCode).toBe(expectedTransformedCode);
  });

  it('should update the named imports', () => {
    const code = `import { welcome } from './welcome';
    welcome();
    `;
    const expectedTransformedCode = `_WELCOME.welcome();`;

    const transformedCode = transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(someFileMetaData)]
    }).code;

    expect(transformedCode).toBe(expectedTransformedCode);
  });

  it('should update the named imports with renames', () => {
    const code = `import { welcome as something } from './welcome';
    something();
    `;
    const expectedTransformedCode = `_WELCOME.welcome();`;

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
    const code = `const counter = 10, value = 2, renamedValue = 3;
    export { value, renamedValue as otherValue };
    export default counter;`;

    transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(someFileMetaData)]
    });

    expect(someFileMetaData.exports).toEqual({
      ___default: 'counter',
      value: 'value',
      otherValue: 'renamedValue'
    });
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

  it('should remove named exports', () => {
    const code = `const counter = 10;
    export { counter };`;

    const transformedCode = transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(someFileMetaData)]
    }).code;

    expect(transformedCode).toBe(`const counter = 10;`);
  });
});

describe('buildExecutableModule()', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create the function with required dependencies', async () => {
    const files = {
      './hello.js': `console.info('hello from hackbox');`
    };
    const fs = new FS(files);
    const module = (
      await buildExecutableModules(getFileMetaData('./hello.js'), fs)
    ).module;

    console.info = jest.fn();
    module();

    expect(console.info).toHaveBeenCalledWith('hello from hackbox');
  });

  it('should return the default export', async () => {
    const files = {
      './hello.js': `function hello() { console.info('hello from export'); }
      export default hello;`
    };
    const fs = new FS(files);
    const module = (
      await buildExecutableModules(getFileMetaData('./hello.js'), fs)
    ).module;

    console.info = jest.fn();
    const exports = module();
    // try running the default export
    exports.___default();

    expect(console.info).toHaveBeenCalledWith('hello from export');
  });

  it('should run with a dependency injected', async () => {
    const files = {
      './welcome.js': `function welcome() { console.info('hello from dep injection') }
      export default welcome;`,
      './hello.js': `import welcome from './welcome.js';
      welcome();`
    };
    const cache = CodeCache.getInstance();
    const fs = new FS(files);
    const entryModule = (
      await buildExecutableModules(getFileMetaData('./hello.js'), fs)
    ).module;

    console.info = jest.fn();
    // try running the module with the _WELCOME dependency
    const entryFunc = new Function(
      'entryModule',
      `entryModule(${cache.get('_WELCOME')?.module}())`
    );

    entryFunc(entryModule);

    expect(console.info).toHaveBeenCalledWith('hello from dep injection');
  });
});

describe('runModule', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // reset the cache
    CodeCache.getInstance().reset();
  });

  it('should run the modules', async () => {
    const files = {
      './welcome.js': `function welcome() { console.info('hello from modules') }
      export default welcome;`,
      './hello.js': `import welcome from './welcome.js';
      welcome();`
    };
    const fs = new FS(files);

    console.info = jest.fn();
    await run(fs, './hello.js');

    expect(console.info).toHaveBeenCalledWith('hello from modules');
  });
});
