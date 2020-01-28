import React, { ReactElement } from 'react';

interface FileIconProps {
  icon: string;
}

export default function FileIcon({ icon }: FileIconProps): ReactElement {
  return <img width="20px" alt="file-explorer icon" src={icon} />;
}
