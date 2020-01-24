import { getFileMetaData } from './utils';
import { FileMetaData } from './file-meta-data';
import { FS } from './services/fs';
import { ExportsMetaData } from './exports-meta-data';
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

        path.remove();
      }
    }
  });
}

export async function buildExecutableModule(
  fileMetaData: FileMetaData,
  fs: FS
) {
  const fileContent = await fs.readFile(fileMetaData.path);

  let transformedCode = (transform(fileContent, {
    presets: ['es2017'],
    plugins: [babelPlugin(fileMetaData)]
  }) as any).code;
  const exports = [];

  // { __default: "hello" } => [ '__default:hello' ]
  for (const exportKey in fileMetaData.exports) {
    exports.push(`${exportKey}: ${fileMetaData.exports.___default}`);
  }
  // [ '__default:hello' ] => '{ __default: hello }'
  const returnValue = `{${exports.join(',')}}`;
  // we have changed the exports into an object that is returned
  transformedCode += `;return ${returnValue};`;
  // wrap the transformed code into function
  const module = new Function('', transformedCode);

  return module;
}

// soon to be implemented
function bundle(): void {
  console.log('will be bundling stuffs soon...');
}

export { bundle };
