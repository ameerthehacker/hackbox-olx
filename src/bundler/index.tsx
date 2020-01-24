import { getFileMetaData } from './utils';
import { FileMetaData } from './file-meta-data';
import { FS } from './services/fs';
import { transform } from '@babel/standalone';

export function babelPlugin(fileMetaData: FileMetaData): () => object {
  return (): object => ({
    visitor: {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      ImportDeclaration(path: any): void {
        const depMetaData = getFileMetaData(path.node.source.value);
        fileMetaData.deps.push(depMetaData);

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
        _HELLO().___default();
        */
        if (defaultImport) {
          path.scope.rename(
            defaultImport.local.name,
            `${depMetaData.canocialName}().___default`
          );
        }

        path.remove();
      },
      ExportDefaultDeclaration(path: any): void {
        fileMetaData.exports.___default = path.node.declaration.name;
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
      }
    }
  });
}

/*
import hello from './hello.js';

hello();

function myHello() { console.log('my hello func') }

export default myHello;
==============================
above code is transformed into
==============================
function module(_HELLO) {
  _HELLO().___default();

  function myHello() { console.log('my hello func') }

  return {
    ___default: myHello
  }
}
*/
export async function buildExecutableModule(
  fileMetaData: FileMetaData,
  fs: FS
) {
  const fileContent = await fs.readFile(fileMetaData.path);

  let transformedCode = (transform(fileContent, {
    presets: ['es2017'],
    plugins: [babelPlugin(fileMetaData)]
  }) as any).code;

  /*
  _HELLO().___default();

  function hello() { console.log('hello world'); }

  export default hello;
  ==============================
  above code is transformed into
  ==============================
  _HELLO().___default();

  function hello() { console.log('hello world'); }
  
  return {
    ___default: hello
  }
  */
  const exports = [];

  for (const exportKey in fileMetaData.exports) {
    exports.push(`${exportKey}: ${fileMetaData.exports.___default}`);
  }
  const returnValue = `{${exports.join(',')}}`;
  transformedCode += `;return ${returnValue};`;

  /*
  function hello() { console.log('hello world'); }
  
  return {
    ___default: hello
  }
  ==============================
  above code is transformed into
  ==============================
  function(_HELLO) {
    _HELLO().___default();

    function hello() { console.log('hello world'); }
  
    return {
      ___default: hello
    }
  }
  */
  const deps = fileMetaData.deps.map((dep) => dep.canocialName);
  const module = new Function(...deps, transformedCode);

  return module;
}

// soon to be implemented
function bundle(): void {
  console.log('will be bundling stuffs soon...');
}

export { bundle };
