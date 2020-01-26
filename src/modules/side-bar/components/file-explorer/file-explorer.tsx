import React, { ReactElement } from 'react';
import { TreeView, TreeItem } from '@material-ui/lab';
import { FS } from '../../../../bundler/services/fs/fs';
import Icon from './components/icon/icon';
import { getFileExt } from '../../../../bundler/utils/utils';
import DefaultFolderSvg from './images/default-folder.svg';
import DefaultFolderOpenSvg from './images/default-folder-open.svg';
import JSSvg from './images/js.svg';
import DefaultFileSvg from './images/default-file.svg';

interface FileExplorerProps {
  rootPath: string;
  fs: FS;
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

export default function FileExplorer({
  rootPath,
  fs
}: FileExplorerProps): ReactElement {
  const paths: string[] = fs.readDir(rootPath);
  const files: string[] = paths.filter(
    (path) => !fs.isDirectory(`${rootPath}/${path}`)
  );
  const directories: string[] = paths.filter((path) =>
    fs.isDirectory(`${rootPath}/${path}`)
  );

  return (
    <TreeView
      defaultExpandIcon={<Icon icon={DefaultFolderSvg} />}
      defaultCollapseIcon={<Icon icon={DefaultFolderOpenSvg} />}
    >
      {directories.map((directory) => {
        const relativePath = `${rootPath}/${directory}`;

        return (
          <TreeItem key={relativePath} label={directory} nodeId={relativePath}>
            <FileExplorer fs={fs} rootPath={relativePath} />
          </TreeItem>
        );
      })}
      {files.map((file) => {
        const relativePath = `${rootPath}/${file}`;

        return (
          <TreeItem
            icon={<Icon icon={getFileIcon(file)} />}
            key={relativePath}
            nodeId={relativePath}
            label={file}
          />
        );
      })}
    </TreeView>
  );
}
