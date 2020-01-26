import React, { ReactElement } from 'react';
import NavBar from '../../components/navbar/navbar';
import SideBar from '../side-bar/side-bar';

export default function App(): ReactElement {
  return (
    <>
      <NavBar />
      <SideBar />
    </>
  );
}
