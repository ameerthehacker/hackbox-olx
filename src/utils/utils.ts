import { ModuleMetaData } from '../bundler';

export function getFileExt(fileName: string): string {
  const fileNameArr = fileName.split('.');
  const fileExt = fileNameArr[fileNameArr.length - 1];

  return fileExt;
}

export function getFileName(filePath: string): string {
  const filePathArr = filePath.split('/');

  return filePathArr[filePathArr.length - 1];
}

export function getFileNameWithoutExt(fileName: string): string {
  const fileNameArr = fileName.split('.');
  const fileExt = fileNameArr[fileNameArr.length - 1];
  const fileNameWithoutExt = fileName.replace(`.${fileExt}`, '');

  return fileNameWithoutExt;
}

export function getAbsolutePath(relativePath: string, cwd: string) {
  const relativePathArr = relativePath.split('/');
  const cwdArr = cwd.split('/');
  const relativePathToCwdArr: string[] = [];

  // remove unwanted trailing slash -> ./components/
  if (cwd.endsWith('/')) {
    cwdArr.pop();
  }

  for (const relativePathSeg of relativePathArr) {
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
  let absoluteFilePathArr = absoluteFilePath.split('/');

  // ./main.js => ['.', 'main.js'] => ['main.js']
  if (absoluteFilePathArr[0] === '.') {
    absoluteFilePathArr.splice(0, 1);
  }
  // remove the extension from filename
  absoluteFilePathArr[absoluteFilePathArr.length - 1] = getFileNameWithoutExt(
    absoluteFilePathArr[absoluteFilePathArr.length - 1]
  );

  // nav-bar -> NAV__BAR
  absoluteFilePathArr = absoluteFilePathArr.map((filePath) =>
    filePath.replace('-', '__').toUpperCase()
  );

  const canocialName = absoluteFilePathArr.join('_');

  return canocialName;
}

export function getDirectoryName(filePath: string): string {
  const filePathArr = filePath.split('/');
  // remove the fileName
  filePathArr.pop();

  return filePathArr.join('/');
}

export function isLocalModule(filePath: string): boolean {
  return filePath.startsWith('./') || filePath.startsWith('../');
}

export function getModuleMetaData(
  filePath: string,
  cwd = '.'
): ModuleMetaData {
  if (isLocalModule(filePath)) {
    const fileName = getFileName(filePath);
    const ext = getFileExt(fileName);
    const canocialName = getCanocialName(filePath, cwd);

    return {
      canocialName,
      fileName,
      ext,
      isLocalModule: true,
      path: filePath,
      deps: []
    };
  } else {
    // external modules are always refered from root
    const canocialName = getCanocialName(filePath, '.');

    return {
      canocialName,
      isLocalModule: false,
      path: filePath,
      deps: []
    };
  }
}
