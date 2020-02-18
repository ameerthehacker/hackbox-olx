import { FS } from '@hackbox/client/services/fs/fs';
import { babelLoader } from './babel-loader';
import { getModuleMetaData } from '@hackbox/client/utils/utils';
import { ModuleMetaData } from '@hackbox/client/modules/bundler/contracts';

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
        } = require('./workers/babel-transform');

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

describe('Babel Loader', () => {
  it('should create the function with required dependencies', async () => {
    const files = {
      './hello.js': `console.info('hello from hackbox');`
    };
    const fs = new FS(files);
    const { moduleDef } = await babelLoader(
      getModuleMetaData('./hello.js'),
      fs
    );

    console.info = jest.fn();
    moduleDef.module();

    expect(console.info).toHaveBeenCalledWith('hello from hackbox');
  });

  it('should return the default export', async () => {
    const files = {
      './hello.js': `function hello() { console.info('hello from export'); }
      export default hello;`
    };
    const fs = new FS(files);
    const { moduleDef } = await babelLoader(
      getModuleMetaData('./hello.js'),
      fs
    );

    console.info = jest.fn();
    const exports = moduleDef.module();
    // try running the default export
    exports.default();

    expect(console.info).toHaveBeenCalledWith('hello from export');
  });
});
