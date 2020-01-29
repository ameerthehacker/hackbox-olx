import React, { ReactElement, useEffect, useState } from 'react';
import { run } from '../../../bundler';
import { FS } from '../../../services/fs/fs';
import { Broadcaster } from '../../../services/broadcaster/broadcaster';
import Loader from '../loader/loader';

const broadcaster = Broadcaster.getInstance();
const fs = new FS();

export default function App(): ReactElement | null {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // tell UI that you are ready
    broadcaster.broadcast('PREVIEW_READY', {});
    broadcaster.listen('FS_UPDATE', (evt: MessageEvent) => {
      fs.importFromJSON(evt.data.message.fsJSON);

      run(fs, evt.data.message.entry).then(() => setIsLoading(false));
    });
  }, []);

  return isLoading ? <Loader /> : null;
}
