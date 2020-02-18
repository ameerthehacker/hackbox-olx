import { jsonLoader } from './json-loader';
import { getModuleMetaData } from '@hackbox/client/utils/utils';
import { FS } from '@hackbox/client/services/fs/fs';

describe('JSON Loader', () => {
  it('module should return the JSON', async () => {
    const dataJSON = `{ "name": "Ameer",  "city": "Hyderabad" }`;
    const jsonMetaData = getModuleMetaData('./data.json');
    const fs = new FS({
      './data.json': dataJSON
    });

    const { moduleDef } = await jsonLoader(jsonMetaData, fs);
    const resultJSON = moduleDef.module();

    expect(resultJSON).toEqual(JSON.parse(dataJSON));
  });
});
