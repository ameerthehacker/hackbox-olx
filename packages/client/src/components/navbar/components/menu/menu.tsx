import React from 'react';
import FileMenu from './components/file-menu/file-menu';
import HelpMenu from './components/help-menu/help-menu';
import { Stack, Box } from '@chakra-ui/core';

export default function MainMenu() {
  return (
    <Stack spacing={1} direction="row">
      <Box>
        <FileMenu />
      </Box>
      <Box>
        <HelpMenu />
      </Box>
    </Stack>
  );
}
