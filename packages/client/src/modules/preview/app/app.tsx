import React, { ReactElement, useEffect, useState } from 'react';
import { Bundler } from '@hackbox/client/modules/bundler';
import { FS } from '@hackbox/client/services/fs/fs';
import {
  Broadcaster,
  FileInit,
  FileUpdate,
  Sync
} from '@hackbox/client/services/broadcaster/broadcaster';
import Loader from '@hackbox/client/components/loader/loader';
import ErrorOverlay from './components/error-overlay/error-overlay';
import { ThemeProvider, Box } from '@chakra-ui/core';

const broadcaster = Broadcaster.getInstance();
const fs = new FS();

export default function App(): ReactElement | null {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  let bundler: Bundler;

  useEffect(() => {
    // tell UI that you are ready
    broadcaster.broadcast('PREVIEW_READY', null);
    broadcaster.listen('FS_INIT', (evt) => {
      evt = evt as FileInit;
      bundler = new Bundler(evt.entry, fs);

      fs.importFromJSON(evt.fsJSON);

      bundler
        .run()
        .then(() => {
          setError(null);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(`${err}`);
        });
    });

    broadcaster.listen('FS_UPDATE', async (evt) => {
      const { updatedFile, updatedFileContent } = evt as FileUpdate;

      await fs.writeFile(updatedFile, updatedFileContent);

      bundler
        .update(updatedFile)
        .then(() => {
          setError(null);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(`${err}`);
        });
    });

    broadcaster.listen('FS_SYNC', async (evt) => {
      const { name, isFile } = evt as Sync;

      if (isFile) {
        await fs.createFile(name);
      } else {
        await fs.mkdir(name);
      }
    });
  }, []);

  if (error) {
    return <ErrorOverlay error={error} />;
  } else if (isLoading) {
    return (
      <ThemeProvider>
        <Box height="100vh">
          <Loader
            message="Transpiling Modules..."
            spinnerProps={{
              color: 'teal.600',
              size: 'xl',
              thickness: '4px'
            }}
          />
        </Box>
      </ThemeProvider>
    );
  } else {
    return null;
  }
}
