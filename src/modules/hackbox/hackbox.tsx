import React, { ReactElement, useContext, useState } from 'react';
import NavBar from '../../components/navbar/navbar';
import SideBar from '../side-bar/side-bar';
import Editor from '../editor/editor';
import PreviewWindow from '../preview-window/preview-window';
import { useSelectedFile } from '../../contexts/selected-file';
import { FSContext } from '../../contexts/fs';
import EmptyState from './components/empty-state/empty-state';
import { Broadcaster } from '../../services/broadcaster/broadcaster';

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
          fsJSON: fs.exportToJSON()
        });
      });
    }
  }

  return (
    <>
      <NavBar />
      <SideBar>
        <>
          {code !== null ? (
            <Editor onSave={onSave} language="javascript" value={code} />
          ) : (
            <EmptyState />
          )}
          <PreviewWindow />
        </>
      </SideBar>
    </>
  );
}
