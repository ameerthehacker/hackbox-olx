import React, {
  ReactElement,
  useContext,
  useState,
  lazy,
  Suspense
} from 'react';
import SideBar from '../side-bar/side-bar';
import { useSelectedFile } from '@hackbox/client/contexts/selected-file';
import { FSContext } from '@hackbox/client/contexts/fs';
import EmptyState from './components/empty-state/empty-state';
import { Broadcaster } from '@hackbox/client/services/broadcaster/broadcaster';
import SplitPane from 'react-split-pane';
import { Box } from '@chakra-ui/core';
import Loader from '@hackbox/client/components/loader/loader';
import NavBar from '@hackbox/client/components/navbar/navbar';

const Editor = lazy(() =>
  import(/* webpackPrefetch: true */ '../editor/editor')
);
const PreviewWindow = lazy(() =>
  import(/* webpackPrefetch: true */ '../preview-window/preview-window')
);

export default function Hackbox(): ReactElement {
  const fs = useContext(FSContext);
  const [code, setCode] = useState<string | null>(null);
  const broadcaster = Broadcaster.getInstance();

  if (fs === undefined) {
    throw new Error('file system not provided');
  }

  const [selectedFile] = useSelectedFile();

  if (selectedFile !== undefined && !fs.isDirectory(selectedFile)) {
    fs.readFile(selectedFile).then((fileContent) => {
      setCode(fileContent);
    });
  }

  function onSave(newCode: string): void {
    if (selectedFile !== undefined) {
      fs?.writeFile(selectedFile, newCode).then(() => {
        broadcaster.broadcast('FS_UPDATE', {
          entry: './index.js',
          updatedFile: selectedFile,
          updatedFileContent: newCode
        });
      });
    }
  }

  return (
    <>
      <NavBar />
      <SideBar>
        <SplitPane
          style={{ height: 'calc(100vh - 57px)' }}
          defaultSize={500}
          primary="second"
        >
          {code !== null ? (
            // the box surrounding editor helps it to play well with splitpane
            <Suspense
              fallback={
                <Loader
                  message="Downloading Editor..."
                  spinnerProps={{
                    color: 'teal.600',
                    size: 'xl',
                    thickness: '4px'
                  }}
                />
              }
            >
              <Box position="absolute" width="100%">
                <Editor onSave={onSave} fs={fs} selectedFile={selectedFile} />
              </Box>
            </Suspense>
          ) : (
            <EmptyState />
          )}
          <Suspense
            fallback={
              <Loader
                message="Preparing Preview..."
                spinnerProps={{
                  color: 'teal.600',
                  size: 'xl',
                  thickness: '4px'
                }}
              />
            }
          >
            <PreviewWindow />
          </Suspense>
        </SplitPane>
      </SideBar>
    </>
  );
}
