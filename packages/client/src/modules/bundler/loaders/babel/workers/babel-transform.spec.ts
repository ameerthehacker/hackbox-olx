import { ModuleMetaData } from '@hackbox/client/modules/bundler/contracts';
import { getModuleMetaData } from '@hackbox/client/utils/utils';
import { transform } from '@babel/standalone';
import { babelPlugin } from './babel-transform';

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

  it('should replace the import by variable declaration', () => {
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
