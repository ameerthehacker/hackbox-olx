import React, { ReactElement } from 'react';
import { Text, Box } from '@chakra-ui/core';

interface ErrorOverlayProps {
  error: string;
}

export default function ErrorOverlay({
  error
}: ErrorOverlayProps): ReactElement {
  return (
    <Box width="100%" bg="white" position="absolute" top={0} bottom={0}>
      <Text color="red" fontSize="1.5em">
        {error}
      </Text>
    </Box>
  );
}
