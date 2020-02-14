import React, { ReactElement, useEffect, useState } from 'react';
import { run, update } from '@hackbox/bundler';
import { FS } from '@hackbox/services/fs/fs';
import {
  Broadcaster,
  FileInit,
  FileUpdate
} from '@hackbox/services/broadcaster/broadcaster';
import Loader from '@hackbox/components/loader/loader';
import ErrorOverlay from '../../components/error-overlay/error-overlay';
import { ThemeProvider, Box } from '@chakra-ui/core';

const broadcaster = Broadcaster.getInstance();
const fs = new FS();

export default function App(): ReactElement | null {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // tell UI that you are ready
    broadcaster.broadcast('PREVIEW_READY', null);
    broadcaster.listen('FS_INIT', (evt) => {
      fs.importFromJSON((evt as FileInit).fsJSON);

      run(fs, evt.entry)
        .then(() => {
          setError(null);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(`${err}`);
        });
    });

    broadcaster.listen('FS_UPDATE', async (evt) => {
      const { entry, updatedFile, updatedFileContent } = evt as FileUpdate;

      await fs.writeFile(updatedFile, updatedFileContent);

      update(fs, entry, updatedFile)
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
