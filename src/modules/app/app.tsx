import React, { ReactElement } from 'react';
import NavBar from '../../components/navbar/navbar';
import SideBar from '../side-bar/side-bar';
import Editor from '../editor/editor';
import Preview from '../preview/preview';

export default function App(): ReactElement {
  return (
    <>
      <NavBar />
      <SideBar>
        <>
          <Editor language="javascript" value={`console.log('hello world');`} />
          <Preview />
        </>
      </SideBar>
    </>
  );
}
