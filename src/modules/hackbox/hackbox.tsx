import React, { ReactElement, useContext, useState } from 'react';
import NavBar from '../../components/navbar/navbar';
import SideBar from '../side-bar/side-bar';
import Editor from '../editor/editor';
import PreviewWindow from '../preview-window/preview-window';
import { useSelectedFile } from '../../contexts/selected-file';
import { FSContext } from '../../contexts/fs';

export default function Hackbox(): ReactElement {
  const fs = useContext(FSContext);
  const [code, setCode] = useState('');

  if (fs === undefined) {
    throw new Error('file system not provided');
  }

  const [selectedFile] = useSelectedFile();

  if (selectedFile !== undefined) {
    fs.readFile(selectedFile).then((fileContent) => {
      setCode(fileContent);
    });
  }

  return (
    <>
      <NavBar />
      <SideBar>
        <>
          <Editor language="javascript" value={code} />
          <PreviewWindow />
        </>
      </SideBar>
    </>
  );
}
