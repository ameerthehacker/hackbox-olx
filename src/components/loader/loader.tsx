import React, { ReactElement } from 'react';
import { Spinner, Flex, Stack, Box, Text, SpinnerProps } from '@chakra-ui/core';

export interface LoaderProps {
  message?: string;
  spinnerProps: SpinnerProps;
}

export default function Loader({
  message,
  spinnerProps
}: LoaderProps): ReactElement {
  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <Stack alignItems="center" spacing={1}>
        <Box>
          <Spinner {...spinnerProps} />
        </Box>
        {message ? (
          <Box>
            <Text>{message}</Text>
          </Box>
        ) : null}
      </Stack>
    </Flex>
  );
}
