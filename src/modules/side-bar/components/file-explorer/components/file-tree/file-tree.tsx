import React, { ReactElement, useState } from 'react';
import { Tree, TreeItem } from '../tree/tree';
import { getFileExt } from '../../../../../../utils/utils';
import JSSvg from './images/js.svg';
import DefaultFileSvg from './images/default-file.svg';
import { Box, Flex } from '@chakra-ui/core';
import FileIcon from '../file-icon/file-icon';
import { FS } from '../../../../../../services/fs/fs';
// SVG images for the file explorer
import DefaultFolderSvg from './images/default-folder.svg';
import DefaultFolderOpenSvg from './images/default-folder-open.svg';
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

const defaultExpandIcon = (
  <Flex alignItems="center">
    <Box fontSize="15px" as={FaChevronRight}></Box>
    <Box ml={1}>
      <FileIcon Icon={DefaultFolderSvg} />
    </Box>
  </Flex>
);

const defaultCollapseIcon = (
  <Flex alignItems="center">
    <Box fontSize="15px" as={FaChevronDown}></Box>
    <Box ml={1}>
      <FileIcon Icon={DefaultFolderOpenSvg} />
    </Box>
  </Flex>
);

export interface FileTreeProps {
  path: string;
  fs: FS | undefined;
  selectedPath: string | undefined;
  onSelected: (path: string) => void;
}

export function getFileIcon(
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

export function FileTree({
  path,
  selectedPath,
  onSelected,
  fs
}: FileTreeProps): ReactElement {
  const directories = fs?.getDirectoriesInPath(path) || [];
  const files = fs?.getFilesInPath(path) || [];
  /* we load the child tree only when is activated by expanding
   * we won't download file icons that are not yet visible
   */
  const [isActivated, setIsActivated] = useState(false);

  return (
    <>
      {directories.map((directory) => {
        const absolutePath = `${path}/${directory}`;

        return (
          <Tree
            collapseIcon={defaultCollapseIcon}
            expandIcon={defaultExpandIcon}
            isSelected={selectedPath === absolutePath}
            onClick={(): void => {
              setIsActivated(true);

              onSelected(absolutePath);
            }}
            key={absolutePath}
            label={directory}
          >
            {isActivated ? (
              <Box ml={2}>
                <FileTree
                  path={absolutePath}
                  fs={fs}
                  onSelected={onSelected}
                  selectedPath={selectedPath}
                />
              </Box>
            ) : null}
          </Tree>
        );
      })}
      {files.map((file) => {
        const absolutePath = `${path}/${file}`;
        const isSelected = selectedPath === absolutePath;

        return (
          <TreeItem
            key={absolutePath}
            onClick={(): void => onSelected(absolutePath)}
            icon={<FileIcon Icon={getFileIcon(file)} />}
            label={file}
            isSelected={isSelected}
          />
        );
      })}
    </>
  );
}
