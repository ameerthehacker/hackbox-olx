import { ModuleMetaData } from '@hackbox/client/modules/bundler/contracts';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function first(array: Array<any>): any {
  return array[0];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function last(array: Array<any>): any {
  return array[array.length - 1];
}

export function getFileExt(fileName: string): string | undefined {
  if (fileName.includes('.')) {
    const fileNameParts = fileName.split('.');
    const fileExt = last(fileNameParts);

    return fileExt;
  } else {
    return undefined;
  }
}

export function getFileName(filePath: string): string {
  const filePathParts = filePath.split('/');

  return last(filePathParts);
}

export function getFileNameWithoutExt(fileName: string): string {
  const fileExt = getFileExt(fileName);
  const fileNameWithoutExt = fileName.replace(`.${fileExt}`, '');

  return fileNameWithoutExt;
}

export function getAbsolutePath(relativePath: string, cwd: string): string {
  const relativePathParts = relativePath.split('/');
  const cwdArr = cwd.split('/');
  const relativePathToCwdArr: string[] = [];

  // remove unwanted trailing slash -> ./components/
  if (cwd.endsWith('/')) {
    cwdArr.pop();
  }

  for (const relativePathSeg of relativePathParts) {
    if (relativePathSeg === '..') {
      cwdArr.pop();
    } else if (relativePathSeg !== '.') {
      relativePathToCwdArr.push(relativePathSeg);
    }
  }

  const absolutePath = `${cwdArr.join('/')}/${relativePathToCwdArr.join('/')}`;

  return absolutePath;
}

export function getCanocialName(filePath: string, cwd = '.'): string {
  const absoluteFilePath = getAbsolutePath(filePath, cwd);
  let absoluteFilePathParts = absoluteFilePath.split('/');

  // ./main.js => ['.', 'main.js'] => ['main.js']
  if (absoluteFilePathParts[0] === '.') {
    absoluteFilePathParts.splice(0, 1);
  }

  // nav-bar -> NAV__BAR
  absoluteFilePathParts = absoluteFilePathParts.map((filePath) =>
    filePath
      .replace(/-/gi, '_HIPEN_')
      .replace(/\./gi, '_DOT_')
      .toUpperCase()
  );

  const canocialName = absoluteFilePathParts.join('_');

  return canocialName;
}

export function getDirectoryName(filePath: string): string {
  const filePathParts = filePath.split('/');
  // remove the fileName
  filePathParts.pop();

  return filePathParts.join('/');
}

export function isLocalModule(filePath: string): boolean {
  return filePath.startsWith('./') || filePath.startsWith('../');
}

export function getModuleMetaData(filePath: string, cwd = '.'): ModuleMetaData {
  const fileName = getFileName(filePath);
  const ext = getFileExt(fileName);
  const isLocalMod = isLocalModule(filePath);
  const canocialName = getCanocialName(filePath, isLocalMod ? cwd : '.');
  const path = isLocalMod ? getAbsolutePath(filePath, cwd) : filePath;

  return {
    canocialName,
    fileName,
    ext,
    isLocalModule: isLocalMod,
    path,
    deps: [],
    usedBy: []
  };
}
