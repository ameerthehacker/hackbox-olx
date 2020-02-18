import {
  getModuleMetaData,
  isLocalModule,
  getCanocialName
} from '@hackbox/client/utils/utils';
import { FS } from '@hackbox/client/services/fs/fs';
import { Cache } from './services/cache/cache';
import { babelLoader } from './loaders/babel';
import { cssLoader } from './loaders/css';

const moduleDefCache = new Cache<ModuleDef>();
const moduleMetaDataCache = new Cache<ModuleMetaData>();
const exportedRefCache = new Cache<ExportsMetaData>();

export interface ModuleDef {
  canocialName: string;
  module: Function;
  deps: string[];
}

export interface ModuleMetaData {
  canocialName: string;
  fileName?: string;
  ext?: string;
  path: string;
  deps: ModuleMetaData[];
  isLocalModule?: boolean;
  exports?: ExportsMetaData;
  usedBy: ModuleMetaData[];
}

export interface ExportsMetaData {
  [name: string]: string;
  default: string;
}

export async function runLoaders(
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
      return await cssLoader(moduleMetaData, fs);
    }
    default: {
      throw new Error(`no loader found for file ${moduleMetaData.fileName}`);
    }
  }
}

export async function buildModules(
  moduleMetaData: ModuleMetaData,
  fs: FS
): Promise<ModuleDef> {
  if (moduleMetaData.isLocalModule && !(await fs.exists(moduleMetaData.path))) {
    throw new Error(`${moduleMetaData.path} does not exists!`);
  }

  // transform that dependency and cache it
  const { hydratedModuleMetaData, moduleDef } = await runLoaders(
    moduleMetaData,
    fs
  );

  moduleMetaDataCache.set(hydratedModuleMetaData.path, hydratedModuleMetaData);
  moduleDefCache.set(hydratedModuleMetaData.canocialName, moduleDef);

  // build the executable modules of all the dependencies first
  for (const dep of hydratedModuleMetaData.deps) {
    // check if the module is already built or not
    if (!moduleDefCache.get(dep.canocialName)) {
      await buildModules(dep, fs);
    }
  }

  return moduleDef;
}

export function runModule(moduleDef: ModuleDef): ExportsMetaData {
  const depRefs: ExportsMetaData[] = [];

  for (const dep of moduleDef.deps) {
    const exportedRef = exportedRefCache.get(dep);

    if (!exportedRef) {
      const depModuleDef = moduleDefCache.get(dep);

      if (depModuleDef !== undefined) {
        const depRef = runModule(depModuleDef);

        depRefs.push(depRef);
      }
    } else {
      depRefs.push(exportedRef);
    }
  }

  const exportedRef = moduleDef.module(...depRefs);
  // update the exportedRef cache
  exportedRefCache.set(moduleDef.canocialName, exportedRef);

  return exportedRef;
}

export async function run(fs: FS, entryFile: string): Promise<void> {
  // clear the cache
  moduleDefCache.reset();
  moduleMetaDataCache.reset();
  exportedRefCache.reset();

  const entryFileMetaData = getModuleMetaData(entryFile);
  // build all the executable modules
  const entryModuleDef = await buildModules(entryFileMetaData, fs);
  // now all the transformed files are in the cache and we can run the entry module
  runModule(entryModuleDef);
}

export function invalidateDependentModules(moduleMetaData: ModuleMetaData) {
  moduleMetaData.usedBy.forEach((usedByModule: ModuleMetaData) => {
    exportedRefCache.unset(moduleMetaData.canocialName);

    invalidateDependentModules(usedByModule);
  });
}

export async function update(
  fs: FS,
  entryFileName: string,
  filePath: string
): Promise<void> {
  const updatedModuleMetaData = moduleMetaDataCache.get(filePath);

  if (updatedModuleMetaData) {
    await buildModules(updatedModuleMetaData, fs);

    // invalidate the cache of all dependent
    invalidateDependentModules(updatedModuleMetaData);

    const entryModuleCanocialName = getCanocialName(entryFileName);

    const entryModuleDef = moduleDefCache.get(entryModuleCanocialName);

    // run the entry module
    if (entryModuleDef) {
      runModule(entryModuleDef);
    } else {
      throw new Error(`${entryFileName} could not be found`);
    }
  }
}
