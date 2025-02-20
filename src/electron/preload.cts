import electron, { ipcMain, ipcRenderer } from "electron";
// 暴露窗口操作到渲染进程
electron.contextBridge.exposeInMainWorld("windowControl", {
  minimize: () => electron.ipcRenderer.invoke("minimize"),
  maximize: () => electron.ipcRenderer.invoke("maximize"),
  hide: () => electron.ipcRenderer.invoke("hide"),
});

electron.contextBridge.exposeInMainWorld("windowEvents", {
  onWindowShow: (...callbacks: (() => void)[]) =>
    ipcRenderer.on("window:show", (event, value) => {
      callbacks.forEach((callback) => {
        callback();
      });
    }),
});

//暴露数据操作到渲染进程
electron.contextBridge.exposeInMainWorld("noteService", {
  //TODO: 传递参数的invoke/send
  saveNote: (name: string, content: string) =>
    electron.ipcRenderer.invoke("note:save", name, content),
  readNote: (name: string) => electron.ipcRenderer.invoke("note:read", name),
  saveExternal: (name: string) =>
    electron.ipcRenderer.invoke("note:saveExternal", name),
  createNote: (name: string) =>
    electron.ipcRenderer.invoke("note:create", name),
  renameNote: (name: string, newName: string) =>
    electron.ipcRenderer.invoke("note:rename", name, newName),
  readRecentTitle: () => electron.ipcRenderer.invoke("note:readRecentTitle"),
  saveRecentTitle: (name: string) =>
    electron.ipcRenderer.invoke("note:saveRecentTitle", name),
  readNoteList: () => electron.ipcRenderer.invoke("notelist:read"),
  deleteNote: (name: string) =>
    electron.ipcRenderer.invoke("note:delete", name),
  readLastNameInList: () =>
    electron.ipcRenderer.invoke("note:readLastNameInList"),
});

electron.contextBridge.exposeInMainWorld("notificationService", {
  scheduleNotification: (delay: number, name: string, content: string) =>
    electron.ipcRenderer.invoke("notification:set", delay, name, content),
});

electron.contextBridge.exposeInMainWorld("shortcutService", {
  modifyGlobalBringUpWindowShortcut: (shortcut?: string[]) =>
    electron.ipcRenderer.invoke("shortcut:applyShortcut", shortcut),
});
