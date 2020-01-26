import React, { ReactElement, useState } from 'react';
import { Box } from '@chakra-ui/core';
import useFormat from '../../components/format/format';
import { FaCopy, FaCog } from 'react-icons/fa';
import SideBarIcon from './components/side-bar-icon/side-bar-icon';
import { IconType } from 'react-icons/lib/cjs';

export default function SideBar(): ReactElement {
  const { bgColor, color } = useFormat();
  const sideBarIcons: IconType[] = [FaCopy, FaCog];
  const [activeSideBarIconIndex, setActiveSideBarIndex] = useState(0);

  return (
    <Box
      color={color}
      bg={bgColor}
      py={0.5}
      borderRightWidth="1px"
      height="100vh"
      width="65px"
    >
      {sideBarIcons.map((sideBarIcon, index) => (
        <SideBarIcon
          onClick={() => setActiveSideBarIndex(index)}
          key={index}
          icon={sideBarIcon}
          isActive={activeSideBarIconIndex === index}
        />
      ))}
    </Box>
  );
}
