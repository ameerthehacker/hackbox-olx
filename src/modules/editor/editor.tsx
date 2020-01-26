import React, { ReactElement } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useColorMode, Box } from '@chakra-ui/core';
import Loading from './components/loading/loading';

interface EditorProps {
  [key: string]: string | number;
}

export default function Editor(props: EditorProps): ReactElement {
  const { colorMode } = useColorMode();

  return (
    <Box borderTopWidth="2px" width="100%">
      <MonacoEditor
        loading={<Loading />}
        {...props}
        options={{
          fontSize: 20
        }}
        height="calc(100vh - 55px)"
        theme={colorMode === 'dark' ? 'vs-dark' : 'vs-light'}
      />
    </Box>
  );
}
