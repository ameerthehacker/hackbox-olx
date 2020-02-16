import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/core';

export default function PreviewWindow(): ReactElement {
  return (
    <Box height="100%">
      <iframe
        title="hackbox-preview"
        height="100%"
        width="100%"
        src={`${window.location.origin}/preview.html`}
      />
    </Box>
  );
}
