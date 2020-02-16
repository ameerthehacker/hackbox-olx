import React, { ReactElement } from 'react';
import { Text, Link, Stack } from '@chakra-ui/core';
import LogoSvg from './logo.svg';

interface LogoProps {
  brandName: string;
}

export default function Logo(props: LogoProps): ReactElement {
  return (
    <Stack spacing={2} isInline>
      <LogoSvg display="inline" height="2em" />
      <Link href="/" _hover={{ textDecoration: 'none' }}>
        <Text as="b" fontSize="xl">
          {props.brandName}
        </Text>
      </Link>
    </Stack>
  );
}
