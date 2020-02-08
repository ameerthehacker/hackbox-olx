import React, { ReactElement, useState } from 'react';
import { Collapse, Box, Flex, theme, PseudoBox } from '@chakra-ui/core';

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
  children?: ReactElement | null;
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
  const styles = getStyles(isSelected);

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
      <Collapse ml={1} isOpen={!isCollapsed}>
        <Box>{children}</Box>
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
  const styles = getStyles(isSelected);

  return (
    <Box
      cursor="pointer"
      p={0.5}
      onClick={(): void => (onClick ? onClick() : null)}
    >
      <Flex>
        {icon} <PseudoBox {...styles}>{label}</PseudoBox>
      </Flex>
    </Box>
  );
}
