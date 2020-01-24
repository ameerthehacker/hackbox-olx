export interface FileMetaData {
  canocialName: string;
  fileName: string;
  ext: string;
  path: string;
  deps: FileMetaData[];
}
