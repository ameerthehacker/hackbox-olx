import React, { ReactElement } from 'react';
import { Spinner, Flex } from '@chakra-ui/core';
import useFormat from '../../../../components/format/format';

export default function Loading(): ReactElement {
  const { bgColor, color } = useFormat();

  return (
    <Flex
      height="calc(100vh - 55px)"
      width="100%"
      bg={bgColor}
      alignItems="center"
      justifyContent="center"
    >
      <Spinner color={color} size="xl" thickness="3px" />
    </Flex>
  );
}
