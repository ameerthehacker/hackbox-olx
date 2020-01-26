import React, { ReactElement } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './modules/app/app';
import * as serviceWorker from './serviceWorker';
import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core';

function Root(): ReactElement {
  return (
    <ThemeProvider>
      <CSSReset />
      <ColorModeProvider>
        <App />
      </ColorModeProvider>
    </ThemeProvider>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
