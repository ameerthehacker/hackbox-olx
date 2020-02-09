import React, {
  ReactElement,
  useRef,
  KeyboardEvent,
  useState,
  useEffect
} from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useColorMode, Box } from '@chakra-ui/core';
import Loader from '@hackbox/components/loader/loader';
import { editor as monacoEditor } from 'monaco-editor';
import { FS } from '@hackbox/services/fs/fs';
import { getFileExt } from '@hackbox/utils/utils';

interface EditorProps {
  fs: FS;
  selectedFile: string | undefined;
  onSave?: (newValue: string) => void;
}

export default function Editor({
  onSave,
  selectedFile,
  fs
}: EditorProps): ReactElement {
  type IStandaloneCodeEditor = monacoEditor.IStandaloneCodeEditor;
  const { colorMode } = useColorMode();
  const editorRef = useRef<IStandaloneCodeEditor>();

  function setEditorLanguage(
    editor: IStandaloneCodeEditor | undefined,
    fileExt: string
  ) {
    const extLanguageMap: { [ext: string]: string } = {
      js: 'javascript',
      css: 'css'
    };
    const language = extLanguageMap[fileExt];

    if (language === undefined) return;

    if (editor !== undefined) {
      const editorModel = editor.getModel();

      if (editorModel !== null) {
        monacoEditor.setModelLanguage(editorModel, language);
      }
    }
  }

  function loadSelectedFileCode(editor: IStandaloneCodeEditor | undefined) {
    if (selectedFile !== undefined && !fs.isDirectory(selectedFile)) {
      if (editor !== undefined) {
        const fileExt = getFileExt(selectedFile);

        fs.readFile(selectedFile).then((fileContent) => {
          editor.getModel()?.setValue(fileContent);
          // reset the scrolling from other files
          editor.setScrollTop(0);

          setEditorLanguage(editor, fileExt);
        });
      }
    }
  }

  useEffect(() => {
    loadSelectedFileCode(editorRef.current);
  }, [selectedFile]);

  function onEditorMounted(_: Function, editor: IStandaloneCodeEditor): void {
    editorRef.current = editor;

    loadSelectedFileCode(editorRef.current);
  }

  function onKeyDown(evt: KeyboardEvent): void {
    if ((evt.metaKey || evt.ctrlKey) && evt.key === 's') {
      evt.preventDefault();

      const editor = editorRef.current;

      if (
        editor !== undefined &&
        onSave !== undefined &&
        selectedFile !== undefined
      ) {
        fs.readFile(selectedFile).then((fileContent) => {
          const currentFileContent = editor.getValue();

          if (currentFileContent !== fileContent) {
            onSave(currentFileContent);
          }
        });
      }
    }
  }

  return (
    <Box onKeyDown={onKeyDown} borderTopWidth="2px">
      <MonacoEditor
        options={{
          fontSize: 20,
          minimap: {
            enabled: false
          },
          wordWrap: 'on',
          selectOnLineNumbers: true
        }}
        editorDidMount={onEditorMounted}
        loading={
          <Loader
            message="Loading Editor..."
            spinnerProps={{
              color: 'teal.600',
              size: 'xl',
              thickness: '4px'
            }}
          />
        }
        height="calc(100vh - 55px)"
        theme={colorMode}
      />
    </Box>
  );
}
