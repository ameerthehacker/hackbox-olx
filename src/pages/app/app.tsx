import React from 'react';
import { run } from '../../bundler';
import { FS } from '../../bundler/services/fs';
import { DEV_FILES } from './dev-files';

run(new FS(DEV_FILES), './main.js');

const App: React.FC = () => {
  return (
    <div>
      <h1>Hello world from hackbox v2</h1>
    </div>
  );
};

export default App;
