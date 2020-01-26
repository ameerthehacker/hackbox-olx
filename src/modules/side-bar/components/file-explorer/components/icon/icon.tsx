import React from 'react';

interface IconProps {
  icon: string;
}

export default function Icon({ icon }: IconProps) {
  return <img alt="file-explorer icon" src={icon} />;
}
