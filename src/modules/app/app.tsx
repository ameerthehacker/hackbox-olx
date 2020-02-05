import React, { ReactElement } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import Hackbox from '../hackbox/hackbox';
import { SelectedFileProvider } from '../../contexts/selected-file';
import { FSContext } from '../../contexts/fs';
import { FS } from '../../services/fs/fs';
import { Broadcaster } from '../../services/broadcaster/broadcaster';

export default function App(): ReactElement {
  // TODO: replace with template files
  const DEV_FILES = {
    './components/counter.js': `import React, { useState } from 'react';
import styled from 'styled-components';

export default function Counter() { 
  const [count, setCount] = useState(0);

  const Button = styled.button\`
    /* Adapt the colors based on primary prop */
    background: \${props => props.primary ? "palevioletred" : "white"};
    color: \${props => props.primary ? "white" : "palevioletred"};

    font-size: 1em;
    margin: 1em;
    padding: 0.25em 1em;
    border: 2px solid palevioletred;
    border-radius: 3px;
  \`;

  function increment() {
    setCount(count => count + 1);
  }

  function decrement() {
    setCount(count => count - 1);
  }

  return (
    <>
      <h1>{count}</h1>
      <Button onClick={increment} primary>+</Button>
      <Button onClick={decrement}>-</Button>
    </>
  );
}    
`,
    './index.js': `import React from 'react';
import ReactDOM from 'react-dom';  
import Counter from './components/counter.js';

ReactDOM.render(<Counter />, document.getElementById('output'));
`
  };

  const broadcaster = Broadcaster.getInstance();

  broadcaster.listen('PREVIEW_READY', () => {
    broadcaster.broadcast('FS_UPDATE', {
      fsJSON: DEV_FILES,
      entry: './index.js'
    });
  });

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
