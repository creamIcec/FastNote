export class CallbackManager {
  private callbacks: (() => void)[];

  private static callbackManager = new CallbackManager();

  private constructor() {
    this.callbacks = [];
  }

  public add(callback: () => void) {
    this.callbacks.push(callback);
  }

  public getAll() {
    return this.callbacks;
  }

  public static getInstance() {
    return this.callbackManager;
  }
}
