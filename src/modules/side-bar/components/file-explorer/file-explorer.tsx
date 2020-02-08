import React, { ReactElement, useState } from 'react';
import { FS } from '../../../../services/fs/fs';
import { useSelectedFile } from '../../../../contexts/selected-file';
import { Box, Flex, Stack, useToast } from '@chakra-ui/core';
import { FaFolderPlus, FaFile } from 'react-icons/fa';
import AddFileOrFolder from './components/add-modal/add-modal';
import { FileTree } from './components/file-tree/file-tree';

export interface FileExplorerProps {
  rootPath: string;
  fs: FS | undefined;
}

export default function FileExplorer({
  fs,
  rootPath
}: FileExplorerProps): ReactElement {
  const [isNewFolderOrFileModalOpen, setIsNewFolderOrFileModalOpen] = useState(
    false
  );
  const [isNewFolder, setIsNewFolder] = useState(false);
  const [selectedFile, setSelectedFile] = useSelectedFile();
  const toast = useToast();

  function showNewFolderModal(): void {
    setIsNewFolder(true);
    setIsNewFolderOrFileModalOpen(true);
  }

  function showNewFileModel(): void {
    setIsNewFolder(false);
    setIsNewFolderOrFileModalOpen(true);
  }

  return (
    <>
      <Box borderBottomWidth="1px" p={1}>
        <Flex alignItems="center" justifyContent="space-between">
          <Box>FILES</Box>
          <Stack direction="row">
            <Box
              onClick={(): void => showNewFolderModal()}
              cursor="pointer"
              as={FaFolderPlus}
            />
            <Box
              onClick={(): void => showNewFileModel()}
              cursor="pointer"
              as={FaFile}
            />
          </Stack>
        </Flex>
      </Box>
      <Box p={1} px={3}>
        <FileTree
          fs={fs}
          path={rootPath}
          onSelected={(path) => setSelectedFile(path)}
          selectedPath={selectedFile}
        />
      </Box>

      <AddFileOrFolder
        onClose={(fileOrFolderName): void => {
          if (fileOrFolderName !== null && fileOrFolderName.length > 0) {
            const selectedPath = fs?.getBasePath(selectedFile || '');
            const fileOrFolderNameWithPath = `${selectedPath}/${fileOrFolderName}`;

            if (isNewFolder) {
              fs?.mkdir(fileOrFolderNameWithPath)
                .then(() => setIsNewFolderOrFileModalOpen(false))
                .catch((err) => {
                  setIsNewFolderOrFileModalOpen(false);

                  toast({
                    title: 'Unable to create folder',
                    description: `${err}`,
                    status: 'error'
                  });
                });
            } else {
              fs?.createFile(fileOrFolderNameWithPath)
                .then(() => setIsNewFolderOrFileModalOpen(false))
                .catch((err) => {
                  setIsNewFolderOrFileModalOpen(false);

                  toast({
                    title: 'Unable to create file',
                    description: `${err}`,
                    status: 'error'
                  });
                });
            }
          } else {
            setIsNewFolderOrFileModalOpen(false);
          }
        }}
        isOpen={isNewFolderOrFileModalOpen}
        isFolder={isNewFolder}
      />
    </>
  );
}
