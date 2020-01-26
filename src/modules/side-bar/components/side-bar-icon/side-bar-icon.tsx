import React from 'react';
import { IconType } from 'react-icons/lib/cjs';
import { Box } from '@chakra-ui/core';
import useFormat from '../../../../components/format/format';

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
}: SideBarIconProps) {
  const { color } = useFormat();

  return (
    <Box
      borderLeftColor={isActive ? color : 'transparent'}
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
