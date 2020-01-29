import React, { ReactElement } from 'react';

export default function PreviewWindow(): ReactElement {
  return <iframe src={`${window.location.origin}/preview/index.html`} />;
}
