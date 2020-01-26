import React, { ReactElement } from 'react';

interface IconProps {
  icon: string;
}

export default function Icon({ icon }: IconProps): ReactElement {
  return <img alt="file-explorer icon" src={icon} />;
}
