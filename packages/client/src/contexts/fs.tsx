import React from 'react';
import { FS } from '@hackbox/client/services/fs/fs';

const FSContext = React.createContext<FS | undefined>(undefined);

export { FSContext };
