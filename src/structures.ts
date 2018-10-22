export type IDisposable = {
    dispose(): Promise<void> | void | any;
}