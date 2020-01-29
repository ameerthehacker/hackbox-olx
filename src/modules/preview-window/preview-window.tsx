import React, { ReactElement } from 'react';

export default function PreviewWindow(): ReactElement {
  return (
    <iframe
      width="1000px"
      src={`${window.location.origin}/preview/index.html`}
    />
  );
}
