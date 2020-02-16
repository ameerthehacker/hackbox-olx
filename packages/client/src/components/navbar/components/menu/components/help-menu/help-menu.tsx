import React from 'react';
import { MenuButton, MenuList, Menu, Button, MenuItem } from '@chakra-ui/core';

export default function HelpMenu() {
  return (
    <Menu>
      <MenuButton as={Button} size="sm">
        Help
      </MenuButton>
      <MenuList placement="top-start">
        <MenuItem
          onClick={() =>
            window.open('https://github.com/ameerthehacker/hackbox/issues/new')
          }
        >
          Report Issue
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
