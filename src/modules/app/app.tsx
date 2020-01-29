import React, { ReactElement } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Hackbox from '../hackbox/hackbox';
import { SelectedFileProvider } from '../../contexts/selected-file';
import { FSContext } from '../../contexts/fs';
import { FS } from '../../services/fs/fs';

export default function App(): ReactElement {
  // TODO: replace with template files
  const DEV_FILES = {
    './modules/welcome.js': `function welcome() { 
  document.getElementById('root').innerHTML='hello world';   
}

export { welcome as something };`,
    './index.js': `import { something as hello } from './modules/welcome.js';

hello();`
  };

  return (
    <SelectedFileProvider>
      <FSContext.Provider value={new FS(DEV_FILES)}>
        <HashRouter>
          <Switch>
            <Route path={'/'} component={Hackbox} exact />
          </Switch>
        </HashRouter>
      </FSContext.Provider>
    </SelectedFileProvider>
  );
}
