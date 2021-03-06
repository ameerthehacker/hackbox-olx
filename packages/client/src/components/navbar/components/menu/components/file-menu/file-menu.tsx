import React, { ReactElement } from 'react';
import { MenuButton, MenuList, Menu, Button, MenuItem } from '@chakra-ui/core';

export default function FileMenu(): ReactElement {
  return (
    <Menu>
      <MenuButton as={Button} size="sm">
        File
      </MenuButton>
      <MenuList placement="bottom-start">
        <MenuItem>New Hackbox</MenuItem>
      </MenuList>
    </Menu>
  );
}
