import React, { ReactElement } from 'react';
import { run } from '../../../bundler';
import { FS } from '../../../services/fs/fs';

const bc = new BroadcastChannel('PREVIEW');
const fs = new FS();

bc.addEventListener('message', (evt: MessageEvent) => {
  fs.importFromJSON(evt.data);

  run(fs, './index.js');
});

export default function App(): ReactElement {
  return <h1>This is preview</h1>;
}
