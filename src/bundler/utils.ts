import { FileMetaData } from './file-meta-data';

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

export function getCanocialName(filePath: string): string {
  const filePathArr = filePath.split('/');
  let canocialName = '';

  // ./main.js => ['.', 'main.js'] => ['main.js']
  if (filePathArr[0] === '.') {
    filePathArr.splice(0, 1);
  }
  // remove the extension from filename
  filePathArr[filePathArr.length - 1] = getFileNameWithoutExt(
    filePathArr[filePathArr.length - 1]
  );

  for (const filePath of filePathArr) {
    canocialName += `_${filePath.toUpperCase()}`;
  }

  return canocialName;
}

export function getFileMetaData(filePath: string): FileMetaData {
  const canocialName = getCanocialName(filePath);
  const fileName = getFileName(filePath);
  const ext = getFileExt(fileName);

  return {
    canocialName,
    fileName,
    ext,
    path: filePath,
    deps: []
  };
}
