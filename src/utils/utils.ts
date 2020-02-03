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

// TODO: take cwd path into account to find correct canocial name
export function getCanocialName(filePath: string): string {
  let filePathArr = filePath.split('/');

  // ./main.js => ['.', 'main.js'] => ['main.js']
  if (filePathArr[0] === '.') {
    filePathArr.splice(0, 1);
  }
  // remove the extension from filename
  filePathArr[filePathArr.length - 1] = getFileNameWithoutExt(
    filePathArr[filePathArr.length - 1]
  );

  // nav-bar -> NAV__BAR
  filePathArr = filePathArr.map((filePath) =>
    filePath.replace('-', '__').toUpperCase()
  );

  const canocialName = filePathArr.join('_');

  return canocialName;
}

export function isLocalModule(filePath: string): boolean {
  return filePath.startsWith('./');
}

export function getModuleMetaData(filePath: string): ModuleMetaData {
  const canocialName = getCanocialName(filePath);

  if (isLocalModule(filePath)) {
    const fileName = getFileName(filePath);
    const ext = getFileExt(fileName);

    return {
      canocialName,
      fileName,
      ext,
      isLocalModule: true,
      path: filePath,
      deps: []
    };
  } else {
    return {
      canocialName,
      isLocalModule: false,
      path: filePath,
      deps: []
    };
  }
}
