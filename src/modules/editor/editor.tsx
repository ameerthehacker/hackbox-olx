import React, { ReactElement, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useColorMode, Box } from '@chakra-ui/core';
import Loading from './components/loading/loading';
import { editor } from 'monaco-editor';

interface EditorProps {
  [key: string]: string | number;
}

export default function Editor(props: EditorProps): ReactElement {
  type IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
  const { colorMode } = useColorMode();
  const editorRef = useRef<IStandaloneCodeEditor>();

  function onEditorMounted(_: Function, editor: IStandaloneCodeEditor): void {
    editorRef.current = editor;
  }

  return (
    <Box borderTopWidth="2px" width="100%">
      <MonacoEditor
        options={{
          fontSize: 20,
          minimap: {
            enabled: false
          },
          wordWrap: 'on',
          selectOnLineNumbers: true
        }}
        {...props}
        editorDidMount={onEditorMounted}
        loading={<Loading />}
        height="calc(100vh - 55px)"
        theme={colorMode}
      />
    </Box>
  );
}
