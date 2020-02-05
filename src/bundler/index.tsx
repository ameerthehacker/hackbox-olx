import { getModuleMetaData } from '../utils/utils';
import { FS } from '../services/fs/fs';
import { transform } from '@babel/standalone';
import { CodeCache } from './services/code-cache/code-cache';

const cache = CodeCache.getInstance();

// TODO: these typing are fucking useless make them better
export interface BabelTypes {
  identifier: (id: string) => object;
  functionExpression: (
    id: any,
    params: any,
    body: any,
    generator: any,
    async: any
  ) => object;
}

export interface ModuleDef {
  module: Function;
  deps: string[];
}

export interface ModuleMetaData {
  canocialName: string;
  fileName?: string;
  ext?: string;
  path: string;
  deps: ModuleMetaData[];
  isLocalModule?: boolean;
  exports?: ExportsMetaData;
}

export interface ExportsMetaData {
  [name: string]: string;
  ___default: string;
}

export function babelPlugin(
  fileMetaData: ModuleMetaData
): ({ types }: { types: BabelTypes }) => object {
  return ({ types }): object => {
    return {
      visitor: {
        ImportDeclaration(path: any): void {
          const depMetaData = getModuleMetaData(path.node.source.value);
          fileMetaData.deps?.push(depMetaData);

          // check if there are any default imports
          const defaultImport = path.node.specifiers.find(
            (specifier: { type: string }) =>
              specifier.type === 'ImportDefaultSpecifier'
          );

          /*
          import hello from './hello.js';
  
          hello();
          ==============================
          above code is transformed into
          ==============================
          var hello$ = HELLO.___default;
          
          hello$();
          */
          if (defaultImport) {
            const localVariableName = `${defaultImport.local.name}$`;

            path.scope.push({
              id: types.identifier(localVariableName),
              init: types.identifier(`${depMetaData.canocialName}.___default`)
            });

            path.scope.rename(defaultImport.local.name, localVariableName);
          }
          // check if there are any named imports and transform them
          const namedImports = path.node.specifiers.filter(
            (specifier: { type: string }) =>
              specifier.type === 'ImportSpecifier'
          );

          /*
          import { hello as something } from './hello.js';
  
          something();
          ==============================
          above code is transformed into
          ==============================
          var something$ = HELLO.hello;

          something$();
          */
          for (const namedImport of namedImports) {
            // namedImport.local.name => something
            // namedImport.imported.name => hello
            const localVariableName = `${namedImport.local.name}$`;

            path.scope.push({
              id: types.identifier(localVariableName),
              init: types.identifier(
                `${depMetaData.canocialName}.${namedImport.imported.name}`
              )
            });

            path.scope.rename(namedImport.local.name, localVariableName);
          }

          path.remove();
        },
        ExportDefaultDeclaration(path: any): void {
          if (fileMetaData.exports === undefined) {
            fileMetaData.exports = {
              ___default: ''
            };
          }

          const declaration = path.node.declaration;

          if (declaration.type === 'Identifier') {
            fileMetaData.exports.___default = path.node.declaration.name;
          } else if (declaration.type === 'FunctionDeclaration') {
            const uid = path.scope.generateUidIdentifier('defaultExportFunc');

            path.scope.push({
              id: uid,
              init: types.functionExpression(
                declaration.id,
                declaration.params,
                declaration.body,
                declaration.generator,
                declaration.async
              )
            });

            fileMetaData.exports.___default = uid.name;
          }
          /*
          function hello() {
            console.log('hello world');
          }
  
          export default hello;
          ==============================
          above code is transformed into
          ==============================
          function hello() {
            console.log('hello world');
          }
          */
          path.remove();
        },
        ExportNamedDeclaration(path: any): void {
          if (fileMetaData.exports === undefined) {
            fileMetaData.exports = {
              ___default: ''
            };
          }
          // check if there are any named exports and transform them
          const namedExports = path.node.specifiers.filter(
            (specifier: { type: string }) =>
              specifier.type === 'ExportSpecifier'
          );

          /*
          function hello() {
            console.log('hello world');
          }
  
          export { hello as something };
          ==============================
          above code is transformed into
          ==============================
          function hello() {
            console.log('hello world');
          }
          */
          for (const namedExport of namedExports) {
            // namedExport.local.name => hello
            // nmaedExport.exported.name => something
            fileMetaData.exports[namedExport.exported.name] =
              namedExport.local.name;
          }

          path.remove();
        }
      }
    };
  };
}

/*
import hello from './hello.js';

hello();

function myHello() { console.log('my hello func') }

export default myHello;
==============================
above code is transformed into
==============================
function module(HELLO) {
  var hello$ = HELLO.___default();

  function myHello() { console.log('my hello func') }

  return {
    ___default: myHello
  }
}
*/
export async function buildExecutableModules(
  moduleMetaData: ModuleMetaData,
  fs: FS
): Promise<ModuleDef> {
  // check if it is local module like ./module.js
  if (moduleMetaData.isLocalModule) {
    let fileContent = '';

    try {
      fileContent = await fs.readFile(moduleMetaData.path);
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new Error(`module ${moduleMetaData.path} does not exists`);
      } else {
        throw err;
      }
    }

    let transformedCode = (transform(fileContent, {
      presets: ['es2015', 'react'],
      plugins: [babelPlugin(moduleMetaData)]
    }) as any).code;

    /*
    var hello$ = HELLO.___default();
  
    function hello() { console.log('hello world'); }
  
    export default hello;
    ==============================
    above code is transformed into
    ==============================
    var hello$ = HELLO.___default();
  
    function hello() { console.log('hello world'); }
    
    return {
      ___default: hello
    }
    */
    const exports = [];

    for (const exportKey in moduleMetaData.exports) {
      const exportedRef = moduleMetaData.exports[exportKey];

      if (exportedRef && exportedRef.trim().length > 0) {
        exports.push(`${exportKey}: ${moduleMetaData.exports[exportKey]}`);
      }
    }
    const returnValue = `{${exports.join(',')}}`;
    /*
      return {
        ___default: hello
      }
    */
    transformedCode += `;return ${returnValue};`;

    /*
    var hello$ = HELLO.___default();
  
    function hello() { console.log('hello world'); }
    
    return {
      ___default: hello
    }
    ==============================
    above code is transformed into
    ==============================
    function(HELLO) {
      var hello$ = HELLO.___default();
  
      function hello() { console.log('hello world'); }
    
      return {
        ___default: hello
      }
    }
    */
    // build the executable modules of all the dependencies first
    for (const dep of moduleMetaData.deps) {
      // check if the module is already built or not
      if (!cache.get(dep.canocialName)) {
        // transform that dependency and cache it
        await buildExecutableModules(dep, fs);
      }
    }

    const depArgs = moduleMetaData.deps.map((dep) => dep.canocialName);
    const moduleDef: ModuleDef = {
      module: new Function(...depArgs, transformedCode),
      deps: depArgs
    };
    // add module to the code cache
    cache.set(moduleMetaData.canocialName, moduleDef);

    return moduleDef;
  } else {
    if (cache.get(moduleMetaData.canocialName)) {
      /* eslint-ignore @typescript-eslint/no-empty-function */
      return (
        cache.get(moduleMetaData.canocialName) || {
          module: (): void => {
            throw new Error('cache was not expected contain a module def');
          },
          deps: []
        }
      );
    }

    // it is an external module like lodash
    const externalModule = await import(
      /* webpackIgnore: true */ `https://dev.jspm.io/${moduleMetaData.path}`
    );

    const module = (): object => {
      if (moduleMetaData.path === 'react') {
        window.React = externalModule.default;
      }

      return {
        ___default: externalModule.default.default || externalModule.default,
        ...externalModule.default
      };
    };

    const moduleDef: ModuleDef = {
      module,
      deps: []
    };

    cache.set(moduleMetaData.canocialName, moduleDef);

    return moduleDef;
  }
}

export function runModule(moduleDef: ModuleDef): ExportsMetaData {
  const depRefs: ExportsMetaData[] = [];

  for (const dep of moduleDef.deps) {
    const depModuleDef = cache.get(dep);

    if (depModuleDef) {
      const depRef = runModule(depModuleDef);

      depRefs.push(depRef);
    }
  }

  return moduleDef.module(...depRefs);
}

export async function run(fs: FS, entryFile: string): Promise<void> {
  // clear the cache
  CodeCache.getInstance().reset();
  const entryFileMetaData = getModuleMetaData(entryFile);
  // build all the executable modules
  const entryModuleDef = await buildExecutableModules(entryFileMetaData, fs);
  // now all the transformed files are in the cache and we can run the entry module
  runModule(entryModuleDef);
}
