import React, { ReactElement } from 'react';
import { TreeView, TreeItem } from '@material-ui/lab';
import { FS } from '../../../../services/fs/fs';
import Icon from './components/icon/icon';
import { getFileExt } from '../../../../utils/utils';
import { makeStyles } from '@material-ui/core';
// SVG images for the file explorer
import DefaultFolderSvg from './images/default-folder.svg';
import DefaultFolderOpenSvg from './images/default-folder-open.svg';
import JSSvg from './images/js.svg';
import DefaultFileSvg from './images/default-file.svg';
import { useSelectedFile } from '../../../../contexts/selected-file';

// these styles are used to remove the default highlight
// may not play well with chakra ui theme
const useTreeItemStyles = makeStyles((theme) => ({
  root: {
    '&:focus > $content': {
      backgroundColor: `transparent`
    },
    padding: theme.spacing(0.15)
  },
  content: {
    padding: theme.spacing(0.15)
  }
}));

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

export default function FileExplorer({
  rootPath,
  fs
}: FileExplorerProps): ReactElement {
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
  const classes = useTreeItemStyles();
  const [, setSelectedFile] = useSelectedFile();

  return (
    <TreeView
      defaultExpandIcon={<Icon icon={DefaultFolderSvg} />}
      defaultCollapseIcon={<Icon icon={DefaultFolderOpenSvg} />}
      className={classes.root}
    >
      {directories.map((directory) => {
        const relativePath = `${rootPath}/${directory}`;

        return (
          <TreeItem
            classes={{
              root: classes.root,
              content: classes.content
            }}
            key={relativePath}
            label={directory}
            nodeId={relativePath}
          >
            <FileExplorer fs={fs} rootPath={relativePath} />
          </TreeItem>
        );
      })}
      {files.map((file) => {
        const relativePath = `${rootPath}/${file}`;

        return (
          <TreeItem
            classes={{
              root: classes.root,
              content: classes.content
            }}
            onClick={(): void => setSelectedFile(relativePath)}
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
