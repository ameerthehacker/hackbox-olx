import {
  getCanocialName,
  getFileNameWithoutExt,
  getFileExt,
  getFileName,
  getModuleMetaData,
  isLocalModule
} from './utils';
import { ModuleMetaData } from '../bundler/contracts/module-meta-data';

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

  describe('getModuleMetaData', () => {
    it('should return the module metadata with isLocal=true for local dependency', () => {
      const filePath = './modules/sub-modules/index.js';

      const fileMetaData: ModuleMetaData = getModuleMetaData(filePath);

      expect(fileMetaData).toEqual({
        ext: 'js',
        canocialName: '_MODULES_SUB-MODULES_INDEX',
        fileName: 'index.js',
        path: filePath,
        deps: [],
        isLocalModule: true
      });
    });

    it('should return the module metadata with isLocal=false for external dependency', () => {
      const filePath = 'lodash';

      const fileMetaData: ModuleMetaData = getModuleMetaData(filePath);

      expect(fileMetaData).toEqual({
        canocialName: '_LODASH',
        path: '',
        deps: [],
        isLocalModule: false
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

      expect(isLocalModule(module)).toBeTruthy();
    });
  });
});
