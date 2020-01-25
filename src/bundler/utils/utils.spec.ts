import {
  getCanocialName,
  getFileNameWithoutExt,
  getFileExt,
  getFileName,
  getFileMetaData
} from './utils';
import { FileMetaData } from '../contracts/file-meta-data';

describe('utils', () => {
  describe('getCanocialName()', () => {
    it('should give the right canocial name', () => {
      const fileName = './components/navbar.js';

      const canocialName = getCanocialName(fileName);

      expect(canocialName).toBe('_COMPONENTS_NAVBAR');
    });
  });

  describe('getFileExt()', () => {
    it('should return the file extension', () => {
      const fileName = 'module.css';

      const ext = getFileExt(fileName);

      expect(ext).toBe('css');
    });
  });

  describe('getFilenameWithoutExt()', () => {
    it('should return the filename without extension', () => {
      const fileName = 'navbar.component.js';

      const fileNameWithoutExt = getFileNameWithoutExt(fileName);

      expect(fileNameWithoutExt).toBe('navbar.component');
    });
  });

  describe('getFilename()', () => {
    it('should return filename from the path', () => {
      const filePath = './modules/sub-module/hello.js';

      const fileName = getFileName(filePath);

      expect(fileName).toBe('hello.js');
    });
  });

  describe('getFileMetaData', () => {
    it('should return the file metdata like filename, ext, canocial name', () => {
      const filePath = './modules/sub-modules/index.js';

      const fileMetaData: FileMetaData = getFileMetaData(filePath);

      expect(fileMetaData).toEqual({
        ext: 'js',
        canocialName: '_MODULES_SUB-MODULES_INDEX',
        fileName: 'index.js',
        path: filePath,
        deps: [],
        exports: {}
      });
    });
  });
});
