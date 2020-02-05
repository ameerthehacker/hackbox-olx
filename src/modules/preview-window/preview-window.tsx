import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/core';

export default function PreviewWindow(): ReactElement {
  return (
    <Box>
      <iframe
        title="hackbox-preview"
        height="100%"
        width="100%"
        src={`${window.location.origin}/preview/index.html`}
      />
    </Box>
  );
}
