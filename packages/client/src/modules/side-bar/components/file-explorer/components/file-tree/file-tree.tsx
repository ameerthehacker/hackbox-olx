import React, {
  ReactElement,
  useState,
  lazy,
  LazyExoticComponent,
  SVGProps,
  FC
} from 'react';
import { Tree, TreeItem } from '../tree/tree';
import { getFileExt } from '@hackbox/client/utils/utils';
import { Box, Flex } from '@chakra-ui/core';
import FileIcon from '../file-icon/file-icon';
import { FS } from '@hackbox/client/services/fs/fs';
// SVG images for the file explorer
import { FaChevronRight, FaChevronDown } from 'react-icons/fa';

export interface FileTreeProps {
  path: string;
  fs: FS | undefined;
  selectedPath: string | undefined;
  onSelected: (path: string) => void;
}

// lazy loaded folder icons
const DefaultFolderSvg = lazy(() =>
  import(/* webpackPrefetch: true */ './images/default-folder.svg')
);
const DefaultFolderOpenSvg = lazy(() =>
  import(/* webpackPrefetch: true */ './images/default-folder-open.svg')
);
const JSFileSvg = lazy(() => import('./images/js.svg'));
const CSFileSvg = lazy(() => import('./images/css.svg'));
const JSONFileSvg = lazy(() => import('./images/json.svg'));
const DefaultFileSvg = lazy(() => import('./images/default-file.svg'));

export function getFileIcon(
  fileName: string
): LazyExoticComponent<FC<SVGProps<SVGSVGElement>>> {
  switch (getFileExt(fileName)) {
    case 'js': {
      return JSFileSvg;
    }
    case 'css': {
      return CSFileSvg;
    }
    case 'json': {
      return JSONFileSvg;
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
