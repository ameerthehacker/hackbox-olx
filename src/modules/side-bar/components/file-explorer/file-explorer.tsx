import React, { ReactElement, useRef } from 'react';
// import { TreeView, TreeItem } from '@material-ui/lab';
import { FS } from '../../../../services/fs/fs';
import FileIcon from './components/file-icon/file-icon';
import { getFileExt } from '../../../../utils/utils';
// SVG images for the file explorer
import DefaultFolderSvg from './images/default-folder.svg';
import DefaultFolderOpenSvg from './images/default-folder-open.svg';
import JSSvg from './images/js.svg';
import DefaultFileSvg from './images/default-file.svg';
import { useSelectedFile } from '../../../../contexts/selected-file';
import { Box, Flex } from '@chakra-ui/core';
import { Tree, TreeItem, TreeConfigContext } from './components/tree/tree';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

interface FileExplorerProps {
  rootPath: string;
  fs: FS | undefined;
}

function getFileIcon(fileName: string): string {
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
            <FileTree fs={fs} rootPath={relativePath} />
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
            icon={<FileIcon icon={getFileIcon(file)} />}
            label={file}
            isSelected={isSelected}
          />
        );
      })}
    </>
  );
}

export default function FileExplorer(props: FileExplorerProps): ReactElement {
  const treeConfigRef = useRef<object>({
    defaultExpandIcon: (
      <Flex alignItems="center">
        <Box fontSize="15px" as={FaChevronRight}></Box>
        <FileIcon ml={1} icon={DefaultFolderSvg} />
      </Flex>
    ),
    defaultCollapseIcon: (
      <Flex alignItems="center">
        <Box fontSize="15px" as={FaChevronDown}></Box>
        <FileIcon ml={1} icon={DefaultFolderOpenSvg} />
      </Flex>
    )
  });

  return (
    <TreeConfigContext.Provider value={treeConfigRef.current}>
      <Box borderBottomWidth="1px" p={1}>
        FILES
      </Box>
      <Box p={1} px={3}>
        <FileTree {...props} />
      </Box>
    </TreeConfigContext.Provider>
  );
}
