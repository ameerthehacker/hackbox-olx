import React, { ReactElement } from 'react';
import { Spinner, Flex } from '@chakra-ui/core';

export default function Loading(): ReactElement {
  return (
    <Flex alignItems="center" justifyContent="center">
      <Spinner size="xl" thickness="3px" />
    </Flex>
  );
}
