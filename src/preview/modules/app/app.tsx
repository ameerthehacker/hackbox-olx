import React, { ReactElement, useEffect } from 'react';
import { run } from '../../../bundler';
import { FS } from '../../../services/fs/fs';
import { Broadcaster } from '../../../services/broadcaster/broadcaster';

const broadcaster = Broadcaster.getInstance();
const fs = new FS();

export default function App(): ReactElement {
  useEffect(() => {
    // tell UI that you are ready
    broadcaster.broadcast('PREVIEW_READY', {});
    broadcaster.listen('FS_UPDATE', (evt: MessageEvent) => {
      fs.importFromJSON(evt.data.message.fsJSON);

      run(fs, evt.data.message.entry);
    });
  }, []);

  return <h1>This is preview</h1>;
}
