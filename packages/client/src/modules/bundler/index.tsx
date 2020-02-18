import {
  getModuleMetaData,
  isLocalModule,
  getCanocialName
} from '@hackbox/client/utils/utils';
import { FS } from '@hackbox/client/services/fs/fs';
import { Cache } from './services/cache/cache';
import { ModuleDef, ModuleMetaData, ExportsMetaData } from './contracts';
import { babelLoader } from './loaders/babel/babel-loader';

export class Bundler {
  private moduleDefCache: Cache<ModuleDef>;
  private moduleMetaDataCache: Cache<ModuleMetaData>;
  private exportedRefCache: Cache<ExportsMetaData>;

  constructor(private entry: string, private fs: FS) {
    this.moduleDefCache = new Cache<ModuleDef>();
    this.moduleMetaDataCache = new Cache<ModuleMetaData>();
    this.exportedRefCache = new Cache<ExportsMetaData>();
  }

  async runLoaders(
    moduleMetaData: ModuleMetaData,
    fs: FS
  ): Promise<{ moduleDef: ModuleDef; hydratedModuleMetaData: ModuleMetaData }> {
    // TODO: fix this special case for react, lodash
    if (!isLocalModule(moduleMetaData.path) && !moduleMetaData.ext) {
      return await babelLoader(moduleMetaData, fs);
    }

    switch (moduleMetaData.ext) {
      case 'js': {
        return await babelLoader(moduleMetaData, fs);
      }
      case 'css': {
        // dynamically load cssLoader as we may not always need it
        const { cssLoader } = await import('./loaders/css/css-loader');

        return await cssLoader(moduleMetaData, fs);
      }
      default: {
        throw new Error(`no loader found for file ${moduleMetaData.fileName}`);
      }
    }
  }

  private async buildModules(
    moduleMetaData: ModuleMetaData,
    fs: FS
  ): Promise<ModuleDef> {
    if (
      moduleMetaData.isLocalModule &&
      !(await fs.exists(moduleMetaData.path))
    ) {
      throw new Error(`${moduleMetaData.path} does not exists!`);
    }

    // transform that dependency and cache it
    const { hydratedModuleMetaData, moduleDef } = await this.runLoaders(
      moduleMetaData,
      fs
    );

    this.moduleMetaDataCache.set(
      hydratedModuleMetaData.path,
      hydratedModuleMetaData
    );
    this.moduleDefCache.set(hydratedModuleMetaData.canocialName, moduleDef);

    // build the executable modules of all the dependencies first
    for (const dep of hydratedModuleMetaData.deps) {
      // check if the module is already built or not
      if (!this.moduleDefCache.get(dep.canocialName)) {
        await this.buildModules(dep, fs);
      }
    }

    return moduleDef;
  }

  private runModule(moduleDef: ModuleDef): ExportsMetaData {
    const depRefs: ExportsMetaData[] = [];

    for (const dep of moduleDef.deps) {
      const exportedRef = this.exportedRefCache.get(dep);

      if (!exportedRef) {
        const depModuleDef = this.moduleDefCache.get(dep);

        if (depModuleDef !== undefined) {
          const depRef = this.runModule(depModuleDef);

          depRefs.push(depRef);
        }
      } else {
        depRefs.push(exportedRef);
      }
    }

    const exportedRef = moduleDef.module(...depRefs);
    // update the exportedRef cache
    this.exportedRefCache.set(moduleDef.canocialName, exportedRef);

    return exportedRef;
  }

  async run(): Promise<void> {
    // clear the cache
    this.moduleDefCache.reset();
    this.moduleMetaDataCache.reset();
    this.exportedRefCache.reset();

    const entryFileMetaData = getModuleMetaData(this.entry);
    // build all the executable modules
    const entryModuleDef = await this.buildModules(entryFileMetaData, this.fs);
    // now all the transformed files are in the cache and we can run the entry module
    this.runModule(entryModuleDef);
  }

  private invalidateDependentModules(moduleMetaData: ModuleMetaData) {
    moduleMetaData.usedBy.forEach((usedByModule: ModuleMetaData) => {
      this.exportedRefCache.unset(moduleMetaData.canocialName);

      this.invalidateDependentModules(usedByModule);
    });
  }

  async update(filePath: string): Promise<void> {
    const updatedModuleMetaData = this.moduleMetaDataCache.get(filePath);

    if (updatedModuleMetaData) {
      await this.buildModules(updatedModuleMetaData, this.fs);

      // invalidate the cache of all dependent
      this.invalidateDependentModules(updatedModuleMetaData);

      const entryModuleCanocialName = getCanocialName(this.entry);

      const entryModuleDef = this.moduleDefCache.get(entryModuleCanocialName);

      // run the entry module
      if (entryModuleDef) {
        this.runModule(entryModuleDef);
      } else {
        throw new Error(`${this.entry} could not be found`);
      }
    }
  }
}
