import { Bundler } from '@hackbox/client/modules/bundler';
import { ModuleMetaData } from '@hackbox/client/modules/bundler/contracts';
import { FS } from '@hackbox/client/services/fs/fs';

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
    const bundler = new Bundler('./hello.js', fs);

    console.info = jest.fn();
    await bundler.run();

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
    const bundler = new Bundler('./index.js', fs);

    console.info = jest.fn();
    await bundler.run();

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
    const bundler = new Bundler('./use-hello1.js', fs);

    console.info = jest.fn();
    await bundler.run();

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
    const bundler = new Bundler('./hello.js', fs);

    console.info = jest.fn();
    await bundler.run();

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
    const bundler = new Bundler('./hello.js', fs);

    console.info = jest.fn();
    await bundler.run();

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
    const bundler = new Bundler('./hello.js', fs);

    console.info = jest.fn();
    await bundler.run();

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
    const bundler = new Bundler('./index.js', fs);

    await bundler.run();

    // update the css
    await fs.writeFile('./index.css', updatedCSS);
    await bundler.update('./index.css');
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
    const bundler = new Bundler('./hello.js', fs);

    await bundler.run();

    console.info = jest.fn();

    // update the file
    await fs.writeFile(
      './welcome.js',
      `function welcome() { console.info('hello from updated exports modules') }
    export { welcome as something };`
    );

    await bundler.update('./welcome.js');

    expect(console.info).toHaveBeenCalledWith(
      'hello from updated exports modules'
    );
    expect(console.info).not.toHaveBeenCalledWith('I do nothing');
  });
});
