import React, { ReactElement } from 'react';
import { TreeView, TreeItem } from '@material-ui/lab';
import { FS } from '../../../../bundler/services/fs/fs';

interface FileExplorerProps {
  rootPath: string;
  fs: FS;
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
    <TreeView>
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
          <TreeItem key={relativePath} nodeId={relativePath} label={file} />
        );
      })}
    </TreeView>
  );
}
