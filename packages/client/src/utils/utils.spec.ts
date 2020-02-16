import {
  getCanocialName,
  getFileNameWithoutExt,
  getFileExt,
  getFileName,
  getModuleMetaData,
  isLocalModule,
  getAbsolutePath,
  getDirectoryName
} from './utils';
import { ModuleMetaData } from '../modules/bundler';

describe('utils', () => {
  describe('getCanocialName()', () => {
    it('should give the right canocial name', () => {
      const fileName = './components/nav-bar.js';

      const canocialName = getCanocialName(fileName);

      expect(canocialName).toBe('COMPONENTS_NAV_HIPEN_BAR_DOT_JS');
    });

    it('should give the same canocial name for different path', () => {
      /*
       * Imaginary filesystem
       * - components
       *    - navbar.js
       * - services
       *    - auth.js
       */
      /*
       * navbar.js
       * import auth from '../services.auth.js'
       */
      const filePath = '../../services/auth.js';
      const cwd = './components/navbar';

      const expectedCanocialName = 'SERVICES_AUTH_DOT_JS';

      expect(getCanocialName(filePath, cwd)).toBe(expectedCanocialName);
    });
  });

  describe('getAbsolutePath', () => {
    /*
     * Imaginary filesystem
     * - components
     *    - navbar.js
     * - services
     *    - auth.js
     */
    /*
     * navbar.js
     * import auth from '../services.auth.js'
     */
    it('should return the absolute path correctly', () => {
      const relativeFilePath = '../../services/auth.js';
      const cwd = './components/navbar/';

      const absolutePath = './services/auth.js';

      expect(getAbsolutePath(relativeFilePath, cwd)).toBe(absolutePath);
    });

    it('should throw a not found error with invalid paths', () => {
      const relativeFilePath = '../../services/auth.js';
      const cwd = './components/navbar';

      try {
        getAbsolutePath(relativeFilePath, cwd);
      } catch (err) {
        expect(err).toBe('ENOENT');
      }
    });
  });

  describe('getFileExt()', () => {
    it('should return the file extension', () => {
      const fileName = 'module.css';

      const ext = getFileExt(fileName);

      expect(ext).toBe('css');
    });
  });

  describe('getDiretoryName()', () => {
    it('should return the containing folder name', () => {
      const filePath = './components/navbar/navbar.js';

      const expectedDirectoryName = './components/navbar';

      expect(getDirectoryName(filePath)).toBe(expectedDirectoryName);
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

  describe('getModuleMetaData', () => {
    it('should return the module metadata with isLocal=true for local dependency', () => {
      const filePath = './modules/sub-modules/index.js';

      const fileMetaData: ModuleMetaData = getModuleMetaData(filePath);

      expect(fileMetaData).toEqual({
        ext: 'js',
        canocialName: 'MODULES_SUB_HIPEN_MODULES_INDEX_DOT_JS',
        fileName: 'index.js',
        path: filePath,
        deps: [],
        isLocalModule: true,
        usedBy: []
      });
    });

    it('should return the module metadata with isLocal=false for external dependency', () => {
      const filePath = 'lodash';

      const fileMetaData: ModuleMetaData = getModuleMetaData(
        filePath,
        './components/counter'
      );

      expect(fileMetaData).toEqual({
        canocialName: 'LODASH',
        path: filePath,
        deps: [],
        isLocalModule: false,
        usedBy: []
      });
    });
  });

  describe('isLocalModule()', () => {
    it('should identify external module', () => {
      const module = 'react';

      expect(isLocalModule(module)).toBeFalsy();
    });

    it('should identify local dependency', () => {
      const module = './local.js';
      const deepModule = '../something.js';

      expect(isLocalModule(module)).toBeTruthy();
      expect(isLocalModule(deepModule)).toBeTruthy();
    });
  });
});
