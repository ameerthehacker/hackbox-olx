import React, { ReactElement } from 'react';
import { MenuButton, MenuList, Menu, Button, MenuItem } from '@chakra-ui/core';

export default function HelpMenu(): ReactElement {
  return (
    <Menu>
      <MenuButton as={Button} size="sm">
        Help
      </MenuButton>
      <MenuList placement="top-start">
        <MenuItem
          onClick={(): Window | null =>
            window.open('https://github.com/ameerthehacker/hackbox/issues/new')
          }
        >
          Report Issue
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
