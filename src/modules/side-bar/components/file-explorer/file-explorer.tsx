import React, { ReactElement, useRef, useState } from 'react';
// import { TreeView, TreeItem } from '@material-ui/lab';
import { FS } from '../../../../services/fs/fs';
import FileIcon from './components/file-icon/file-icon';
import { getFileExt } from '../../../../utils/utils';
// SVG images for the file explorer
import { ReactComponent as DefaultFolderSvg } from './images/default-folder.svg';
import { ReactComponent as DefaultFolderOpenSvg } from './images/default-folder-open.svg';
import { ReactComponent as JSSvg } from './images/js.svg';
import { ReactComponent as DefaultFileSvg } from './images/default-file.svg';
import { useSelectedFile } from '../../../../contexts/selected-file';
import { Box, Flex, Stack, useToast } from '@chakra-ui/core';
import { Tree, TreeItem, TreeConfigContext } from './components/tree/tree';
import {
  FaChevronRight,
  FaChevronDown,
  FaFolderPlus,
  FaFile
} from 'react-icons/fa';
import AddFileOrFolder from './components/add-modal/add-modal';

export interface FileExplorerProps {
  rootPath: string;
  fs: FS | undefined;
}

function getFileIcon(
  fileName: string
): React.FC<React.SVGProps<SVGSVGElement>> {
  switch (getFileExt(fileName)) {
    case 'js': {
      return JSSvg;
    }
    default:
      return DefaultFileSvg;
  }
}

function FileTree({ rootPath, fs }: FileExplorerProps): ReactElement {
  if (fs === undefined) {
    throw new Error('file system not provided');
  }

  const paths: string[] = fs.readDir(rootPath);
  const files: string[] = paths.filter(
    (path) => !fs.isDirectory(`${rootPath}/${path}`)
  );
  const directories: string[] = paths.filter((path) =>
    fs.isDirectory(`${rootPath}/${path}`)
  );
  const [selectedFile, setSelectedFile] = useSelectedFile();

  return (
    <>
      {directories.map((directory) => {
        const relativePath = `${rootPath}/${directory}`;

        return (
          <Tree
            isSelected={selectedFile === relativePath}
            onClick={(): void => setSelectedFile(relativePath)}
            key={relativePath}
            label={directory}
          >
            <Box ml={2}>
              <FileTree fs={fs} rootPath={relativePath} />
            </Box>
          </Tree>
        );
      })}
      {files.map((file) => {
        const relativePath = `${rootPath}/${file}`;
        const isSelected = selectedFile === relativePath;

        return (
          <TreeItem
            key={relativePath}
            onClick={(): void => setSelectedFile(relativePath)}
            icon={<FileIcon Icon={getFileIcon(file)} />}
            label={file}
            isSelected={isSelected}
          />
        );
      })}
    </>
  );
}

export default function FileExplorer(props: FileExplorerProps): ReactElement {
  const [isNewFolderOrFileModalOpen, setIsNewFolderOrFileModalOpen] = useState(
    false
  );
  const [isNewFolder, setIsNewFolder] = useState(false);
  const [selectedFile] = useSelectedFile();
  const toast = useToast();

  const treeConfigRef = useRef<object>({
    defaultExpandIcon: (
      <Flex alignItems="center">
        <Box fontSize="15px" as={FaChevronRight}></Box>
        <Box ml={1}>
          <FileIcon Icon={DefaultFolderSvg} />
        </Box>
      </Flex>
    ),
    defaultCollapseIcon: (
      <Flex alignItems="center">
        <Box fontSize="15px" as={FaChevronDown}></Box>
        <Box ml={1}>
          <FileIcon Icon={DefaultFolderOpenSvg} />
        </Box>
      </Flex>
    )
  });

  function showNewFolderModal(): void {
    setIsNewFolder(true);
    setIsNewFolderOrFileModalOpen(true);
  }

  function showNewFileModel(): void {
    setIsNewFolder(false);
    setIsNewFolderOrFileModalOpen(true);
  }

  return (
    <TreeConfigContext.Provider value={treeConfigRef.current}>
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
        <FileTree {...props} />
      </Box>

      <AddFileOrFolder
        onClose={(fileOrFolderName): void => {
          if (fileOrFolderName !== null && fileOrFolderName.length > 0) {
            const { fs } = props;

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
    </TreeConfigContext.Provider>
  );
}
