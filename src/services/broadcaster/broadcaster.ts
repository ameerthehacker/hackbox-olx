type EVENTS = 'FS_UPDATE' | 'PREVIEW_READY';

export class Broadcaster {
  private static instance: Broadcaster;

  private constructor(private bc = new BroadcastChannel('GLOBAL')) {}

  public static getInstance(): Broadcaster {
    if (this.instance == null) {
      this.instance = new Broadcaster();
    }

    return this.instance;
  }

  public broadcast(event: EVENTS, message: string | object): void {
    this.bc.postMessage({
      type: event,
      message
    });
  }

  public listen(event: EVENTS, cb: (evt: MessageEvent) => void): void {
    this.bc.addEventListener('message', (evt) => {
      if (evt.data.type === event) {
        cb(evt);
      }
    });
  }
}
