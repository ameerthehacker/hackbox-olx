import { transform } from '@babel/standalone';
import { buildModules, run, update } from '@hackbox/client/modules/bundler';
import { babelPlugin } from './loaders/babel/workers/babel-transform';
import { ModuleMetaData } from '@hackbox/client/modules/bundler';
import { getModuleMetaData } from '@hackbox/client/utils/utils';
import { FS } from '@hackbox/client/services/fs/fs';
import { Cache } from './services/cache/cache';

type BabelTransformType = (
  fileContent: string,
  moduleMetaData: ModuleMetaData
) => Promise<{
  transformedCode: string;
  hydratedModuleMetaData: ModuleMetaData;
}>;

type ComLinkType = {
  wrap(worker: {
    URL: string;
  }): { babelTransform: BabelTransformType } | undefined;
  expose(): void;
};

// jest does not support web workers so we need to simulate it
/* eslint-disable @typescript-eslint/no-empty-function */
jest.mock(
  'comlink',
  (): ComLinkType => {
    return {
      wrap: (worker: {
        URL: string;
      }): { babelTransform: BabelTransformType } | undefined => {
        /* eslint-disable @typescript-eslint/no-var-requires */
        const {
          babelTransform
        }: {
          babelTransform: BabelTransformType;
        } = require('./loaders/babel/workers/babel-transform');

        if (worker.URL.includes('transform.worker.ts')) {
          return {
            babelTransform: (
              filecontent: string,
              moduleMetaData: ModuleMetaData
            ): Promise<{
              transformedCode: string;
              hydratedModuleMetaData: ModuleMetaData;
            }> => Promise.resolve(babelTransform(filecontent, moduleMetaData))
          };
        }
      },
      expose: (): void => {}
    };
  }
);

let someFileMetaData: ModuleMetaData;

describe('Babel plugin', () => {
  beforeEach(() => {
    someFileMetaData = getModuleMetaData('./hello.js');
    jest.resetAllMocks();
  });

  it('should update the default imports', () => {
    const code = `import welcome from './welcome';
    welcome();
    `;
    const expectedTransformedCode = `var welcome$ = WELCOME.default;
welcome$();`;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const transformedCode = (transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(someFileMetaData)]
    }) as any).code;

    expect(transformedCode).toBe(expectedTransformedCode);
  });

  it('it should replace the import by variable declaration', () => {
    const someFileMetaData = getModuleMetaData('./hello.js');
    const code = `import counter from './counter.js'`;
    const expectedTransformedCode = `var counter$ = COUNTER_DOT_JS.default;`;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const transformedCode = (transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(someFileMetaData)]
    }) as any).code;

    expect(transformedCode).toBe(expectedTransformedCode);
  });

  it('should update the named imports', () => {
    const code = `import { welcome } from './welcome';
    welcome();
    `;
    const expectedTransformedCode = `var welcome$ = WELCOME.welcome;
welcome$();`;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const transformedCode = (transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(someFileMetaData)]
    }) as any).code;

    expect(transformedCode).toBe(expectedTransformedCode);
  });

  it('should update the named imports with renames', () => {
    const code = `import { welcome as something } from './welcome';
    something();
    `;
    const expectedTransformedCode = `var something$ = WELCOME.welcome;
something$();`;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const transformedCode = (transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(someFileMetaData)]
    }) as any).code;

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
      {
        ...getModuleMetaData('./modules/dep1'),
        usedBy: [someFileMetaData]
      },
      {
        ...getModuleMetaData('./modules/dep2'),
        usedBy: [someFileMetaData]
      }
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
      default: 'counter',
      value: 'value',
      otherValue: 'renamedValue'
    });
  });

  it('should return the usedBy as array', () => {
    const code = `import welcome from './welcome.js'
    const counter = 10, value = 2, renamedValue = 3;
    export { value, renamedValue as otherValue };
    export default counter;`;

    transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(someFileMetaData)]
    });

    expect(someFileMetaData.deps[0].usedBy).toEqual([someFileMetaData]);
  });

  it('should return the inline default export function', () => {
    const code = `export default function someName() { console.log('ha ha') }`;

    transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(someFileMetaData)]
    });

    expect(someFileMetaData.exports).toEqual({
      default: '_defaultExportFunc'
    });
  });

  it('should remove default exports', () => {
    const code = `const counter = 10;
    export default counter;`;
    const expectedTransformedCode = `const counter = 10;`;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const transformedCode = (transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(someFileMetaData)]
    }) as any).code;

    expect(transformedCode).toBe(expectedTransformedCode);
  });

  it('should handle the anonymous default exports', () => {
    const code = `export default function someName() { console.log('ha ha') }`;
    const expectedTransformedCode = `var _defaultExportFunc = function someName() {
  console.log('ha ha');
};`;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const transformedCode = (transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(someFileMetaData)]
    }) as any).code;

    expect(transformedCode).toBe(expectedTransformedCode);
  });

  it('should remove named exports', () => {
    const code = `const counter = 10;
    export { counter };`;
    const expectedTransformedCode = `const counter = 10;`;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const transformedCode = (transform(code, {
      presets: ['es2017'],
      plugins: [babelPlugin(someFileMetaData)]
    }) as any).code;

    expect(transformedCode).toBe(expectedTransformedCode);
  });
});

describe('buildExecutableModules()', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should create the function with required dependencies', async () => {
    const files = {
      './hello.js': `console.info('hello from hackbox');`
    };
    const fs = new FS(files);
    const module = (await buildModules(getModuleMetaData('./hello.js'), fs))
      .module;

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
    const module = (await buildModules(getModuleMetaData('./hello.js'), fs))
      .module;

    console.info = jest.fn();
    const exports = module();
    // try running the default export
    exports.default();

    expect(console.info).toHaveBeenCalledWith('hello from export');
  });
});

describe('run()', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should run the modules with default imports, exports', async () => {
    const files = {
      './welcome.js': `function welcome() { console.info('hello from default import/export modules') }
      export default welcome;`,
      './hello.js': `import welcome from './welcome.js';
      welcome();`
    };
    const fs = new FS(files);

    console.info = jest.fn();
    await run(fs, './hello.js');

    expect(console.info).toHaveBeenCalledWith(
      'hello from default import/export modules'
    );
  });

  it('should create the required stylesheets', async () => {
    const files = {
      './index.css': `body {
        background: green;
      }`,
      './index.js': `import './index.css';`
    };
    const fs = new FS(files);

    console.info = jest.fn();
    await run(fs, './index.js');

    const stylesheet = document.getElementById('INDEX_DOT_CSS');

    expect(stylesheet?.innerText).toBe(files['./index.css']);
  });

  it('should evaluate the module only once', async () => {
    const files = {
      './use-hello1.js': `import hello from './hello.js';
                          import something from './components/use-hello2.js'`,
      './components/use-hello2.js': `import hello from '../hello.js';`,
      './hello.js': `console.info("Hi I'm hello.js")`
    };
    const fs = new FS(files);

    console.info = jest.fn();
    await run(fs, './use-hello1.js');

    expect(console.info).toHaveBeenCalledWith("Hi I'm hello.js");
    expect(console.info).toHaveBeenCalledTimes(1);
  });

  it('should run the modules with named imports, exports', async () => {
    const files = {
      './welcome.js': `function welcome() { console.info('hello from named import/export modules') }
      export { welcome };`,
      './hello.js': `import { welcome } from './welcome.js';
      welcome();`
    };
    const fs = new FS(files);

    console.info = jest.fn();
    await run(fs, './hello.js');

    expect(console.info).toHaveBeenCalledWith(
      'hello from named import/export modules'
    );
  });

  it('should run the modules with renamed imports', async () => {
    const files = {
      './welcome.js': `function welcome() { console.info('hello from renamed import modules') }
      export { welcome };`,
      './hello.js': `import { welcome as hello } from './welcome.js';
      hello();`
    };
    const fs = new FS(files);

    console.info = jest.fn();
    await run(fs, './hello.js');

    expect(console.info).toHaveBeenCalledWith(
      'hello from renamed import modules'
    );
  });

  it('should run the modules with renamed exports', async () => {
    const files = {
      './welcome.js': `function welcome() { console.info('hello from renamed exports modules') }
      export { welcome as something };`,
      './hello.js': `import { something as hello } from './welcome.js';
      hello();`
    };
    const fs = new FS(files);

    console.info = jest.fn();
    await run(fs, './hello.js');

    expect(console.info).toHaveBeenCalledWith(
      'hello from renamed exports modules'
    );
  });
});

describe('update()', () => {
  it('should update the stylesheets', async () => {
    const files = {
      './index.css': `body {
        background: green;
      }`,
      './index.js': `import './index.css';`
    };
    const fs = new FS(files);
    const updatedCSS = `
    body {
      background: red;
    }
    `;

    await run(fs, './index.js');

    // update the css
    await fs.writeFile('./index.css', updatedCSS);
    await update(fs, './index.js', './index.css');
    const stylesheet = document.getElementById('INDEX_DOT_CSS');

    expect(stylesheet?.innerText).toBe(updatedCSS);
  });

  it('should run the modules with renamed export values', async () => {
    const files = {
      './welcome.js': `function welcome() { console.info('hello from renamed exports modules') }
      export { welcome as something };`,
      './something.js': `console.info('I do nothing');
      export default null;`,
      './hello.js': `import { something as hello } from './welcome.js';
      import nothing from './something.js';
      hello();`
    };
    const fs = new FS(files);

    await run(fs, './hello.js');

    console.info = jest.fn();

    // update the file
    await fs.writeFile(
      './welcome.js',
      `function welcome() { console.info('hello from updated exports modules') }
    export { welcome as something };`
    );

    await update(fs, './hello.js', './welcome.js');

    expect(console.info).toHaveBeenCalledWith(
      'hello from updated exports modules'
    );
    expect(console.info).not.toHaveBeenCalledWith('I do nothing');
  });
});
