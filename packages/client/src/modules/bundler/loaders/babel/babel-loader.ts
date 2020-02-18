import * as comlink from 'comlink';
import {
  ModuleMetaData,
  ModuleDef
} from '@hackbox/client/modules/bundler/contracts';
import BabelWorker from 'worker-loader!./workers/transform.worker.ts';
import { FS } from '@hackbox/client/services/fs/fs';

const babelWorker = comlink.wrap<{
  babelTransform(
    fileContent: string,
    moduleMetaData: ModuleMetaData
  ): { transformedCode: string; hydratedModuleMetaData: ModuleMetaData };
}>(new BabelWorker());

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
      canocialName: hydratedModuleMetaData.canocialName
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
      canocialName: moduleMetaData.canocialName
    };

    return {
      moduleDef,
      hydratedModuleMetaData: moduleMetaData
    };
  }
}
