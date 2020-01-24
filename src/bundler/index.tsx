import { getFileMetaData } from './utils';
import { FileMetaData } from './file-meta-data';

export function babelPlugin(deps: FileMetaData[]): () => object {
  return (): object => ({
    visitor: {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      ImportDeclaration(path: any): void {
        deps.push(getFileMetaData(path.node.source.value));

        path.remove();
      }
    }
  });
}

// soon to be implemented
function bundle(): void {
  console.log('will be bundling stuffs soon...');
}

export { bundle };
