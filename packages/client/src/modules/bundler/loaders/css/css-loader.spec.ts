import { cssLoader } from './css-loader';
import { getModuleMetaData } from '@hackbox/client/utils/utils';
import { FS } from '@hackbox/client/services/fs/fs';

describe('CSS Loader', () => {
  it('should add the styles as a style tag', async () => {
    const styles = `h1 {
      color: red;
    }`;
    const stylesMetaData = getModuleMetaData('./index.css');
    const fs = new FS({
      './index.css': styles
    });

    const { moduleDef } = await cssLoader(stylesMetaData, fs);
    moduleDef.module();

    expect(document.getElementById(moduleDef.canocialName)?.innerText).toBe(
      styles
    );
  });
});
