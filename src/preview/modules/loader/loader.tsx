import React, { ReactElement } from 'react';
import { ThemeProvider, Spinner, Flex } from '@chakra-ui/core';

export default function Loader(): ReactElement {
  return (
    <ThemeProvider>
      <Flex
        height="calc(100vh -  55px)"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner color="teal.600" size="xl" thickness="4px" />
      </Flex>
    </ThemeProvider>
  );
}
