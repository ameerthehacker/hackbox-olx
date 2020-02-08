import React, { ReactElement } from 'react';
import { Flex, Text, Stack, Box } from '@chakra-ui/core';
import useFormat from '../../../../components/format/format';
import BoxSvg from './box.svg';

export default function EmptyState(): ReactElement {
  const { bgColor, color } = useFormat();

  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      bg={bgColor}
      color={color}
      width="100%"
      height="100%"
    >
      <Stack spacing={2}>
        <Box>
          <BoxSvg fill={color} />
        </Box>
        <Text fontSize="2xl" fontWeight="light">
          Select a file to start editing
        </Text>
      </Stack>
    </Flex>
  );
}
