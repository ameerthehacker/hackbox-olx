import { ModuleMetaData, ModuleDef } from '../../contracts';
import { FS } from '@hackbox/client/services/fs/fs';
import { first } from '@hackbox/client/utils/utils';

export async function cssLoader(
  moduleMetaData: ModuleMetaData,
  fs: FS,
  eventCb?: (event: string) => void
): Promise<{ hydratedModuleMetaData: ModuleMetaData; moduleDef: ModuleDef }> {
  let fileContent = '';

  if (moduleMetaData.isLocalModule) {
    fileContent = await fs.readFile(moduleMetaData.path);
  } else {
    const packageName = first(moduleMetaData.path.split('/'));

    if (eventCb) eventCb(`Downloading stylesheet from ${packageName}`);

    fileContent = await (
      await fetch(`https://dev.jspm.io/${moduleMetaData.path}`)
    ).text();
  }

  const module = (): HTMLElement => {
    let stylesheet = document.getElementById(moduleMetaData.canocialName);

    if (!stylesheet) {
      // create the stylesheet
      stylesheet = document.createElement('style');
      stylesheet.id = moduleMetaData.canocialName;
      // attach it to head tag
      document.head.appendChild(stylesheet);
    }

    stylesheet.innerText = fileContent;

    return stylesheet;
  };

  const moduleDef: ModuleDef = {
    canocialName: moduleMetaData.canocialName,
    deps: [],
    module
  };

  return { hydratedModuleMetaData: moduleMetaData, moduleDef };
}
