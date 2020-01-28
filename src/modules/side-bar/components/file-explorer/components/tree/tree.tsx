import React, { ReactElement, useState, useContext } from 'react';
import { Collapse, Box, Flex } from '@chakra-ui/core';
import { TreeConfigContext } from './contexts/tree-config';

interface TreeProps {
  collapseIcon?: ReactElement;
  expandIcon?: ReactElement;
  children: ReactElement;
  label: string;
}

export function Tree({
  collapseIcon,
  expandIcon,
  label,
  children
}: TreeProps): ReactElement {
  const [isCollapsed, setIsCollaped] = useState(true);
  const treeConfig = useContext(TreeConfigContext);

  collapseIcon = collapseIcon || treeConfig?.defaultCollapseIcon;
  expandIcon = expandIcon || treeConfig?.defaultExpandIcon;

  return (
    <>
      <Box
        cursor="pointer"
        onClick={() => setIsCollaped((isCollapsed) => !isCollapsed)}
      >
        <Flex>
          {isCollapsed ? expandIcon : collapseIcon} {label}
        </Flex>
      </Box>
      <Collapse isOpen={!isCollapsed}>{children}</Collapse>
    </>
  );
}

interface TreeItemProps {
  label: string;
  icon?: ReactElement;
  onClick?: Function;
}

export function TreeItem({
  label,
  icon,
  onClick
}: TreeItemProps): ReactElement {
  const treeConfig = useContext(TreeConfigContext);

  icon = icon || treeConfig?.defaultIcon;

  return (
    <Box cursor="pointer" onClick={(): void => (onClick ? onClick() : null)}>
      <Flex>
        {icon} {label}
      </Flex>
    </Box>
  );
}

export { TreeConfigContext };
