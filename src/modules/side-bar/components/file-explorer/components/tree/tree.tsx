import React, { ReactElement, useState, useContext } from 'react';
import { Collapse, Box, Flex, theme, PseudoBox } from '@chakra-ui/core';
import { TreeConfigContext } from './contexts/tree-config';

function getStyles(isSelected: boolean): object {
  const stylesIfSelected = {
    color: theme.colors.teal[500]
  };
  const stylesIfNotSelected = {
    _hover: {
      color: theme.colors.teal[300]
    }
  };
  const styles = isSelected ? stylesIfSelected : stylesIfNotSelected;

  return styles;
}

interface TreeProps {
  collapseIcon?: ReactElement;
  expandIcon?: ReactElement;
  children: ReactElement;
  label: string;
  isSelected?: boolean;
  onClick?: Function;
}

export function Tree({
  collapseIcon,
  expandIcon,
  label,
  children,
  isSelected = false,
  /* eslint-disable @typescript-eslint/no-empty-function */
  onClick = (): void => {}
}: TreeProps): ReactElement {
  const [isCollapsed, setIsCollaped] = useState(true);
  const treeConfig = useContext(TreeConfigContext);
  const styles = getStyles(isSelected);

  collapseIcon = collapseIcon || treeConfig?.defaultCollapseIcon;
  expandIcon = expandIcon || treeConfig?.defaultExpandIcon;

  return (
    <>
      <Box
        p={0.5}
        cursor="pointer"
        onClick={(): void => {
          setIsCollaped((isCollapsed) => !isCollapsed);
          onClick();
        }}
      >
        <Flex alignItems="center">
          <Box>{isCollapsed ? expandIcon : collapseIcon}</Box>
          <PseudoBox ml={1} {...styles}>
            {label}
          </PseudoBox>
        </Flex>
      </Box>
      <Collapse isOpen={!isCollapsed}>
        <Box ml={1}>{children}</Box>
      </Collapse>
    </>
  );
}

interface TreeItemProps {
  label: string;
  icon?: ReactElement;
  isSelected?: boolean;
  onClick?: Function;
}

export function TreeItem({
  label,
  icon,
  onClick,
  isSelected = false
}: TreeItemProps): ReactElement {
  const treeConfig = useContext(TreeConfigContext);
  const styles = getStyles(isSelected);

  icon = icon || treeConfig?.defaultIcon;

  return (
    <Box
      cursor="pointer"
      marginLeft={1}
      p={0.5}
      onClick={(): void => (onClick ? onClick() : null)}
    >
      <Flex>
        {icon} <PseudoBox {...styles}>{label}</PseudoBox>
      </Flex>
    </Box>
  );
}

export { TreeConfigContext };
