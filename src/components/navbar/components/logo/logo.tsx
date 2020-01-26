import React, { ReactElement } from 'react';
import { Text, Image, Link, Stack } from '@chakra-ui/core';
import logo from './logo.svg';

interface LogoProps {
  brandName: string;
}

export default function Logo(props: LogoProps): ReactElement {
  return (
    <Stack spacing={2} isInline>
      <Image display="inline" height="2em" src={logo} />
      <Link href="/" _hover={{ textDecoration: 'none' }}>
        <Text as="b" fontSize="xl">
          {props.brandName}
        </Text>
      </Link>
    </Stack>
  );
}
