import React, { ReactElement } from 'react';
import { Spinner, Flex } from '@chakra-ui/core';
import useFormat from '../../../../components/format/format';

export default function Loading(): ReactElement {
  const { bgColor, color } = useFormat();

  return (
    <Flex
      width="100%"
      bg={bgColor}
      height="100%"
      alignItems="center"
      justifyContent="center"
    >
      <Spinner color={color} size="xl" thickness="3px" />
    </Flex>
  );
}
