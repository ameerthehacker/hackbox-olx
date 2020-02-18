import {
  getModuleMetaData,
  getCanocialName,
  isLocalModule
} from '@hackbox/client/utils/utils';
import { FS } from '@hackbox/client/services/fs/fs';
import { ModuleCache } from './services/module-cache/module-cache';
import * as comlink from 'comlink';
import BabelWorker from 'worker-loader!./workers/babel/babel.worker.ts';

const moduleCache = ModuleCache.getInstance();

// we should not add this to the render function as it will be downloaded during every render
const babelWorker = comlink.wrap<{
  babelTransform(
    fileContent: string,
    moduleMetaData: ModuleMetaData
  ): { transformedCode: string; hydratedModuleMetaData: ModuleMetaData };
}>(new BabelWorker());

export interface ModuleDef {
  module: Function;
  exportedRef?: ExportsMetaData;
  deps: string[];
  metaData: ModuleMetaData;
}

export interface ModuleMetaData {
  canocialName: string;
  fileName?: string;
  ext?: string;
  path: string;
  deps: ModuleMetaData[];
  isLocalModule?: boolean;
  exports?: ExportsMetaData;
  usedBy: ModuleMetaData[];
}

export interface ExportsMetaData {
  [name: string]: string;
  default: string;
}

export async function cssLoader(
  moduleMetaData: ModuleMetaData,
  fs: FS
): Promise<{ hydratedModuleMetaData: ModuleMetaData; moduleDef: ModuleDef }> {
  let fileContent = '';

  if (moduleMetaData.isLocalModule) {
    try {
      fileContent = await fs.readFile(moduleMetaData.path);
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new Error(`module ${moduleMetaData.path} does not exists`);
      } else {
        throw err;
      }
    }
  } else {
    fileContent = await (
      await fetch(`https://dev.jspm.io/${moduleMetaData.path}`)
    ).text();
  }

  const module = (): HTMLElement => {
    let stylesheet = document.getElementById(moduleMetaData.canocialName);

    if (!stylesheet) {
      // create the stylesheet
      stylesheet = document.createElement('style');
      stylesheet.id = moduleMetaData.canocialName;
      // attach it to head tag
      document.head.appendChild(stylesheet);
    }

    stylesheet.innerText = fileContent;

    return stylesheet;
  };

  const moduleDef: ModuleDef = {
    deps: [],
    metaData: moduleMetaData,
    module
  };

  moduleCache.set(moduleMetaData.canocialName, moduleDef);

  return { hydratedModuleMetaData: moduleMetaData, moduleDef };
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
export async function babelLoader(
  moduleMetaData: ModuleMetaData,
  fs: FS
): Promise<{ moduleDef: ModuleDef; hydratedModuleMetaData: ModuleMetaData }> {
  if (moduleMetaData.isLocalModule) {
    const fileContent = await fs.readFile(moduleMetaData.path);

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
    const depArgs = hydratedModuleMetaData.deps.map((dep) => dep.canocialName);
    const moduleDef: ModuleDef = {
      module: new Function(...depArgs, transformedCode),
      deps: depArgs,
      metaData: hydratedModuleMetaData
    };

    return {
      moduleDef,
      hydratedModuleMetaData
    };
  } else {
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
      deps: [],
      metaData: moduleMetaData
    };

    moduleCache.set(moduleMetaData.canocialName, moduleDef);

    return {
      moduleDef,
      hydratedModuleMetaData: moduleMetaData
    };
  }
}

export async function runLoaders(
  moduleMetaData: ModuleMetaData,
  fs: FS
): Promise<{ moduleDef: ModuleDef; hydratedModuleMetaData: ModuleMetaData }> {
  // TODO: fix this special case for react, lodash
  if (!isLocalModule(moduleMetaData.path) && !moduleMetaData.ext) {
    return await babelLoader(moduleMetaData, fs);
  }

  switch (moduleMetaData.ext) {
    case 'js': {
      return await babelLoader(moduleMetaData, fs);
    }
    case 'css': {
      return await cssLoader(moduleMetaData, fs);
    }
    default: {
      throw new Error(`no loader found for file ${moduleMetaData.fileName}`);
    }
  }
}

export async function buildModules(
  moduleMetaData: ModuleMetaData,
  fs: FS
): Promise<ModuleDef> {
  // transform that dependency and cache it
  const { hydratedModuleMetaData, moduleDef } = await runLoaders(
    moduleMetaData,
    fs
  );

  moduleCache.set(hydratedModuleMetaData.canocialName, moduleDef);

  // build the executable modules of all the dependencies first
  for (const dep of hydratedModuleMetaData.deps) {
    // check if the module is already built or not
    if (!moduleCache.get(dep.canocialName)) {
      await buildModules(dep, fs);
    }
  }

  return moduleDef;
}

export function runModule(moduleDef: ModuleDef): ExportsMetaData {
  const depRefs: ExportsMetaData[] = [];

  for (const dep of moduleDef.deps) {
    const depModuleDef = moduleCache.get(dep);

    if (depModuleDef) {
      if (depModuleDef.exportedRef === undefined) {
        const depRef = runModule(depModuleDef);

        depRefs.push(depRef);
      } else {
        const depRef = depModuleDef.exportedRef;

        depRefs.push(depRef);
      }
    }
  }

  const exportedRef = moduleDef.module(...depRefs);
  // update the module definition with exported reference
  moduleDef.exportedRef = exportedRef;

  return exportedRef;
}

export async function run(fs: FS, entryFile: string): Promise<void> {
  // clear the cache
  ModuleCache.getInstance().reset();
  const entryFileMetaData = getModuleMetaData(entryFile);
  // build all the executable modules
  const entryModuleDef = await buildModules(entryFileMetaData, fs);
  // now all the transformed files are in the cache and we can run the entry module
  runModule(entryModuleDef);
}

export function invalidateTree(moduleMetaData: ModuleMetaData) {
  moduleMetaData.usedBy.forEach((usedByModule: ModuleMetaData) => {
    const usedByModuleDef = moduleCache.get(usedByModule.canocialName);

    if (usedByModuleDef) {
      // burst the exportRef cache
      usedByModuleDef.exportedRef = undefined;

      // burst the cache of it's parent
      invalidateTree(usedByModule);
    } else {
      throw new Error(`${usedByModule.fileName} could not be found`);
    }
  });
}

export async function update(
  fs: FS,
  entryFileName: string,
  filePath: string
): Promise<void> {
  const updatedModuleMetaData = getModuleMetaData(filePath);
  const updatedModuleDef = moduleCache.get(updatedModuleMetaData.canocialName);

  if (updatedModuleDef) {
    await buildModules(updatedModuleDef.metaData, fs);

    // invalidate the cache of all dependent
    invalidateTree(updatedModuleDef.metaData);

    const entryModuleMetaData = getModuleMetaData(entryFileName);
    const entryModuleDef = moduleCache.get(entryModuleMetaData.canocialName);

    // run the entry module
    if (entryModuleDef) {
      runModule(entryModuleDef);
    } else {
      throw new Error(`${entryFileName} could not be found`);
    }
  }
}
