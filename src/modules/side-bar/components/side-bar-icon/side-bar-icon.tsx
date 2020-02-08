import React, { ReactElement } from 'react';
import { IconType } from 'react-icons/lib/cjs';
import { Box, theme } from '@chakra-ui/core';
import useFormat from '@hackbox/components/format/format';

interface SideBarIconProps {
  icon: IconType;
  opacity?: number;
  isActive?: boolean;
  onClick?: () => void;
}

export default function SideBarIcon({
  icon,
  opacity = 0.8,
  isActive = false,
  onClick
}: SideBarIconProps): ReactElement {
  const { color } = useFormat();

  return (
    <Box
      borderLeftColor={isActive ? theme.colors.teal[500] : 'transparent'}
      borderLeftWidth={4}
      cursor="pointer"
      p={2}
      color={color}
      opacity={opacity}
      fontSize="3.4em"
      as={icon}
      onClick={onClick}
    />
  );
}
