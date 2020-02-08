import React, { ReactElement } from 'react';

interface FileIconProps {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export default function FileIcon({ Icon }: FileIconProps): ReactElement {
  return <Icon width="20px" />;
}
