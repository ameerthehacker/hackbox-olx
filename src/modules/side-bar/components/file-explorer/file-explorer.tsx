import React, { ReactElement } from 'react';
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
import { theme, PseudoBox } from '@chakra-ui/core';
import { Tree, TreeItem, TreeConfigContext } from './components/tree/tree';

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
          <Tree key={relativePath} label={directory}>
            <FileTree fs={fs} rootPath={relativePath} />
          </Tree>
        );
      })}
      {files.map((file) => {
        const relativePath = `${rootPath}/${file}`;
        const stylesIfSelected = {
          bg: theme.colors.teal[500],
          color: theme.colors.white,
          borderLeftWidth: '4px',
          borderRightColor: theme.colors.teal[500],
          borderLeftColor: theme.colors.teal[700]
        };
        const stylesIfNotSelected = {
          _hover: {
            bg: theme.colors.teal[50],
            color: theme.colors.black
          }
        };
        const isSelected = selectedFile === relativePath;
        const styles = isSelected ? stylesIfSelected : stylesIfNotSelected;

        return (
          <PseudoBox {...styles} key={relativePath}>
            <TreeItem
              onClick={(): void => setSelectedFile(relativePath)}
              icon={<FileIcon icon={getFileIcon(file)} />}
              label={file}
            />
          </PseudoBox>
        );
      })}
    </>
  );
}

export default function FileExplorer(props: FileExplorerProps) {
  return (
    <TreeConfigContext.Provider
      value={{
        defaultExpandIcon: <FileIcon icon={DefaultFolderSvg} />,
        defaultCollapseIcon: <FileIcon icon={DefaultFolderOpenSvg} />
      }}
    >
      <FileTree {...props} />
    </TreeConfigContext.Provider>
  );
}
