import React, { ReactElement } from 'react';

interface TreeConfig {
  defaultCollapseIcon?: ReactElement;
  defaultExpandIcon?: ReactElement;
  defaultIcon?: ReactElement;
}

const TreeConfigContext = React.createContext<TreeConfig | undefined>(
  undefined
);

export { TreeConfigContext };
