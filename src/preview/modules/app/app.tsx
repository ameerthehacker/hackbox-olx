import React, { ReactElement, useEffect, useState } from 'react';
import { run } from '../../../bundler';
import { FS } from '../../../services/fs/fs';
import { Broadcaster } from '../../../services/broadcaster/broadcaster';
import Loader from '../../../components/loader/loader';
import ErrorOverlay from '../../components/error-overlay/error-overlay';
import { ThemeProvider } from '@chakra-ui/core';

const broadcaster = Broadcaster.getInstance();
const fs = new FS();

export default function App(): ReactElement | null {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // tell UI that you are ready
    broadcaster.broadcast('PREVIEW_READY', {});
    broadcaster.listen('FS_UPDATE', (evt: MessageEvent) => {
      fs.importFromJSON(evt.data.message.fsJSON);

      run(fs, evt.data.message.entry)
        .then(() => {
          setError(null);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(`${err}`);
        });
    });
  }, []);

  if (error) {
    return <ErrorOverlay error={error} />;
  } else if (isLoading) {
    return (
      <ThemeProvider>
        <Loader
          message="Transpiling Modules..."
          spinnerProps={{
            color: 'teal.600',
            size: 'xl',
            thickness: '4px'
          }}
        />
      </ThemeProvider>
    );
  } else {
    return null;
  }
}
