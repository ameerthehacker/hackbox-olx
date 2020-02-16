import React, { useContext, ReactElement, useState } from 'react';

type SetSelectedFileType = (selectedFile: string) => void;

const SelectedFileContext = React.createContext<string | undefined>(undefined);
const SetSelectedFileContext = React.createContext<
  SetSelectedFileType | undefined
>(undefined);

function SelectedFileProvider({
  children
}: {
  children: ReactElement;
}): ReactElement {
  const [selectedFile, setSelectedFile] = useState<string | undefined>(
    undefined
  );

  return (
    <SelectedFileContext.Provider value={selectedFile}>
      <SetSelectedFileContext.Provider value={setSelectedFile}>
        {children}
      </SetSelectedFileContext.Provider>
    </SelectedFileContext.Provider>
  );
}

function useSelectedFile(): [string | undefined, SetSelectedFileType] {
  const selectedFileContext = useContext(SelectedFileContext);
  const setSelectedFileContext = useContext(SetSelectedFileContext);

  if (selectedFileContext === null || setSelectedFileContext == null) {
    throw new Error('component is not wrapped with SelectedFileProvider');
  }

  return [selectedFileContext, setSelectedFileContext];
}

export { SelectedFileProvider, useSelectedFile };
