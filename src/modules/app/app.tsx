import React, { ReactElement } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Hackbox from '../hackbox/hackbox';

export default function App(): ReactElement {
  return (
    <>
      <HashRouter>
        <Switch>
          <Route path={'/'} component={Hackbox} exact />
        </Switch>
      </HashRouter>
    </>
  );
}
