import React, { ReactElement } from 'react';
import {
  Box,
  useColorMode,
  Flex,
  Link,
  Icon,
  Stack,
  Button
} from '@chakra-ui/core';
import Logo from './components/logo/logo';
import GitHubLogo from './github-logo.svg';
import useFormat from '../format/format';
import MainMenu from './components/menu/menu';

interface NavBarProps {
  showBrandName?: boolean;
}

export default function NavBar({
  showBrandName = false
}: NavBarProps): ReactElement {
  const { colorMode, toggleColorMode } = useColorMode();
  const { bgColor, color } = useFormat();

  return (
    <Box
      color={color}
      bg={bgColor}
      px={4}
      py={3}
      borderBottomWidth="1px"
      position="absolute"
      top={0}
      w="100%"
      zIndex={999}
    >
      <Flex alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={4}>
          <Box>
            <Logo brandName={showBrandName ? 'hackbox' : ''} />
          </Box>
          <Box>
            <MainMenu />
          </Box>
        </Stack>
        <Stack spacing={2} direction="row">
          <Link href="https://github.com/ameerthehacker/hackbox" isExternal>
            <GitHubLogo height="1.5em" opacity="0.65" fill={color} />
          </Link>
          <Button variant="link" onClick={toggleColorMode}>
            <Icon
              height="1.5em"
              width="1.5em"
              name={colorMode === 'light' ? 'moon' : 'sun'}
            />
          </Button>
        </Stack>
      </Flex>
    </Box>
  );
}
