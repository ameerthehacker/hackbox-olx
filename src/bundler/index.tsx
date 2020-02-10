import { getModuleMetaData } from '@hackbox/utils/utils';
import { FS } from '@hackbox/services/fs/fs';
import { CodeCache } from './services/code-cache/code-cache';
import * as comlink from 'comlink';
import BabelWorker from 'worker-loader!./workers/babel/babel.worker.ts';

const cache = CodeCache.getInstance();

// we should not add this to the render function as it will be downloaded during every render
const babelWorker = comlink.wrap<{
  babelTransform(
    fileContent: string,
    moduleMetaData: ModuleMetaData
  ): { transformedCode: string; hydratedModuleMetaData: ModuleMetaData };
}>(new BabelWorker());

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
  default: string;
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
  var hello$ = HELLO.default;

  hello$();

  function myHello() { console.log('my hello func') }

  return {
    get default() { return myHello; }
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

    /* eslint-disable prefer-const */
    let {
      transformedCode,
      hydratedModuleMetaData
    } = await babelWorker.babelTransform(fileContent, moduleMetaData);

    /*
    var hello$ = HELLO.default;

    hello$();
  
    function myHello() { console.log('hello world'); }
  
    export default myHello;
    ==============================
    above code is transformed into
    ==============================
    var hello$ = HELLO.default;

    hello$();
  
    function myHello() { console.log('hello world'); }
    
    return {
      get default() { return myHello; }
    }
    */
    const exports = [];

    for (const exportKey in hydratedModuleMetaData.exports) {
      const exportedRef = hydratedModuleMetaData.exports[exportKey];

      if (exportedRef && exportedRef.trim().length > 0) {
        exports.push(`get ${exportKey}() { return ${exportedRef}; }`);
      }
    }

    const returnValue = `{${exports.join(',')}}`;
    /*
      return {
        get default() { return hello; }
      }
    */
    transformedCode += `;return ${returnValue};`;

    /*
    var hello$ = HELLO.default();

    hello$();
  
    function myHello() { console.log('hello world'); }
    
    return {
      get default() { return hello; }
    }
    ==============================
    above code is transformed into
    ==============================
    function(HELLO) {
      var hello$ = HELLO.default();

      hello$();
    
      function myHello() { console.log('hello world'); }
      
      return {
        get default() { return hello; }
      }
    }
    */
    // build the executable modules of all the dependencies first
    for (const dep of hydratedModuleMetaData.deps) {
      // check if the module is already built or not
      if (!cache.get(dep.canocialName)) {
        // transform that dependency and cache it
        await buildExecutableModules(dep, fs);
      }
    }

    const depArgs = hydratedModuleMetaData.deps.map((dep) => dep.canocialName);
    const moduleDef: ModuleDef = {
      module: new Function(...depArgs, transformedCode),
      deps: depArgs
    };
    // add module to the code cache
    cache.set(hydratedModuleMetaData.canocialName, moduleDef);

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
        default: externalModule.default.default || externalModule.default,
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
