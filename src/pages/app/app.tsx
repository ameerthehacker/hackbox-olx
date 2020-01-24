import React from 'react';
import { bundle } from '../../bundler';

bundle();

const App: React.FC = () => {
  return (
    <div>
      <h1>Hello world from hackbox v2</h1>
    </div>
  );
};

export default App;
