import { ExportsMetaData } from './exports-meta-data';

export interface FileMetaData {
  canocialName: string;
  fileName: string;
  ext: string;
  path: string;
  deps: FileMetaData[];
  exports: ExportsMetaData;
}
