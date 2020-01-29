import React, { ReactElement } from 'react';
import {
  ThemeProvider,
  Spinner,
  Flex,
  Stack,
  Box,
  Text
} from '@chakra-ui/core';

export default function Loader(): ReactElement {
  return (
    <ThemeProvider>
      <Flex
        height="calc(100vh -  55px)"
        alignItems="center"
        justifyContent="center"
      >
        <Stack alignItems="center" spacing={1}>
          <Box>
            <Spinner color="teal.600" size="xl" thickness="4px" />
          </Box>
          <Box>
            <Text>Transpiling modules...</Text>
          </Box>
        </Stack>
      </Flex>
    </ThemeProvider>
  );
}
