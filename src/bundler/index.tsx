import { getFileMetaData } from './utils';
import { FileMetaData } from './file-meta-data';
import { FS } from './services/fs';
import { ExportsMetaData } from './exports-meta-data';

export function babelPlugin(fileMetaData: FileMetaData): () => object {
  return (): object => ({
    visitor: {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      ImportDeclaration(path: any): void {
        fileMetaData.deps.push(getFileMetaData(path.node.source.value));

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
  const module = new Function('', fileContent);

  return module;
}

// soon to be implemented
function bundle(): void {
  console.log('will be bundling stuffs soon...');
}

export { bundle };
