import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useColorMode } from '@chakra-ui/core';

interface EditorProps {
  [key: string]: string | number;
}

export default function Editor(props: EditorProps) {
  const { colorMode } = useColorMode();

  return (
    <MonacoEditor
      {...props}
      options={{
        fontSize: 20
      }}
      height="calc(100vh - 55px)"
      theme={colorMode === 'dark' ? 'vs-dark' : 'vs-light'}
    />
  );
}
