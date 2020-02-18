type EVENTS = 'FS_UPDATE' | 'PREVIEW_READY' | 'FS_INIT' | 'FS_SYNC';

export interface FileUpdate {
  updatedFile: string;
  updatedFileContent: string;
}

export interface Sync {
  name: string;
  isFile: boolean;
}

export interface FileInit {
  fsJSON: { [key: string]: string };
  entry: string;
}

export class Broadcaster {
  private static instance: Broadcaster;

  private constructor(private bc = new BroadcastChannel('GLOBAL')) {}

  public static getInstance(): Broadcaster {
    if (this.instance == null) {
      this.instance = new Broadcaster();
    }

    return this.instance;
  }

  public broadcast(
    event: EVENTS,
    message: string | FileUpdate | FileInit | Sync | null
  ): void {
    this.bc.postMessage({
      type: event,
      message
    });
  }

  public listen(
    event: EVENTS,
    cb: (evt: FileUpdate | FileInit | Sync) => void
  ): void {
    this.bc.addEventListener('message', (evt) => {
      if (evt.data.type === event) {
        cb(evt.data.message);
      }
    });
  }
}
