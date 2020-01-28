import React, { ReactElement } from 'react';
import { Image } from '@chakra-ui/core';

interface FileIconProps {
  icon: string;
  [key: string]: string | number;
}

export default function FileIcon({
  icon,
  ...rest
}: FileIconProps): ReactElement {
  return <Image {...rest} width="20px" alt="file-explorer icon" src={icon} />;
}
