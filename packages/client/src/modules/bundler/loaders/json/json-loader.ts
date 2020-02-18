import { ModuleMetaData, ModuleDef } from '../../contracts';
import { FS } from '@hackbox/client/services/fs/fs';
import { first } from '@hackbox/client/utils/utils';

export async function jsonLoader(
  moduleMetaData: ModuleMetaData,
  fs: FS,
  eventCb?: (event: string) => void
): Promise<{ hydratedModuleMetaData: ModuleMetaData; moduleDef: ModuleDef }> {
  let fileContent = '';

  if (moduleMetaData.isLocalModule) {
    fileContent = await fs.readFile(moduleMetaData.path);
  } else {
    const packageName = first(moduleMetaData.path.split('/'));

    if (eventCb) eventCb(`Downloading JSON from ${packageName}`);

    fileContent = await (
      await fetch(`https://dev.jspm.io/${moduleMetaData.path}`)
    ).text();
  }

  // check if is valid JSON
  try {
    JSON.parse(fileContent);
  } catch {
    throw new Error(`${moduleMetaData.path} contains invalid JSON`);
  }

  const transFormedCode = `return ${fileContent};`;

  const module = new Function(transFormedCode);

  const moduleDef: ModuleDef = {
    canocialName: moduleMetaData.canocialName,
    deps: [],
    module
  };

  return { hydratedModuleMetaData: moduleMetaData, moduleDef };
}
