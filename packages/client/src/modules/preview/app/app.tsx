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
import {
  ThemeProvider,
  Box,
  Spinner,
  CSSReset,
  Text,
  Stack
} from '@chakra-ui/core';

const broadcaster = Broadcaster.getInstance();
const fs = new FS();

export default function App(): ReactElement | null {
  const [loadingMessage, setLoadingMessage] = useState<string | null>(
    'Please wait...'
  );
  const [error, setError] = useState<string | null>(null);
  let bundler: Bundler;
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  useEffect(() => {
    // tell UI that you are ready
    broadcaster.broadcast('PREVIEW_READY', null);
    broadcaster.listen('FS_INIT', (evt) => {
      evt = evt as FileInit;
      bundler = new Bundler(evt.entry, fs);

      fs.importFromJSON(evt.fsJSON);

      bundler
        .run((evt: string) => setLoadingMessage(evt))
        .then(() => {
          setError(null);
        })
        .catch((err) => {
          setError(`${err}`);
        })
        .finally(() => setLoadingMessage(null));
    });

    broadcaster.listen('FS_UPDATE', async (evt) => {
      const { updatedFile, updatedFileContent } = evt as FileUpdate;
      await fs.writeFile(updatedFile, updatedFileContent);

      // TODO: don't show update message oftent to avoid annoying
      bundler
        .update(updatedFile, (event: string) => setUpdateMessage(event))
        .then(() => {
          setError(null);
        })
        .catch((err) => {
          setError(`${err}`);
        })
        .finally(() => {
          setUpdateMessage(null);
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
  } else if (updateMessage !== null) {
    return (
      <ThemeProvider>
        <Box
          color="white"
          width="100%"
          left={0}
          position="absolute"
          top={0}
          bg="gray.700"
        >
          <Stack
            p={2}
            alignItems="center"
            justifyContent="center"
            direction="row"
            spacing={1}
          >
            <Spinner size="sm" />
            <Text>{updateMessage}</Text>
          </Stack>
        </Box>
      </ThemeProvider>
    );
  } else if (loadingMessage !== null) {
    return (
      <ThemeProvider>
        <Box height="100vh">
          <Loader
            message={loadingMessage}
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
