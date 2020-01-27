import React from 'react';
import { FS } from '../services/fs/fs';

const FSContext = React.createContext<FS | undefined>(undefined);

export { FSContext };
