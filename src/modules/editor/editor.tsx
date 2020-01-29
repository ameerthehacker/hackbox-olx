import React, { ReactElement, useRef, KeyboardEvent } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useColorMode, Box } from '@chakra-ui/core';
import Loading from './components/loading/loading';
import { editor } from 'monaco-editor';

interface EditorProps {
  [key: string]: string | number | Function | undefined;
  onSave?: (newValue: string) => void;
}

export default function Editor({
  onSave,
  ...restProps
}: EditorProps): ReactElement {
  type IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
  const { colorMode } = useColorMode();
  const editorRef = useRef<IStandaloneCodeEditor>();

  function onEditorMounted(_: Function, editor: IStandaloneCodeEditor): void {
    editorRef.current = editor;
  }

  function onKeyDown(evt: KeyboardEvent): void {
    if ((evt.metaKey || evt.ctrlKey) && evt.key === 's') {
      evt.preventDefault();

      if (editorRef.current !== undefined && onSave !== undefined) {
        // don't trigger save if the file contents don't change
        if (restProps.value !== editorRef.current.getValue()) {
          onSave(editorRef.current.getValue());
        }
      }
    }
  }

  return (
    <Box onKeyDown={onKeyDown} borderTopWidth="2px" width="100%">
      <MonacoEditor
        options={{
          fontSize: 20,
          minimap: {
            enabled: false
          },
          wordWrap: 'on',
          selectOnLineNumbers: true
        }}
        {...restProps}
        editorDidMount={onEditorMounted}
        loading={<Loading />}
        height="calc(100vh - 55px)"
        theme={colorMode}
      />
    </Box>
  );
}
