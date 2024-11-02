import electron, { ipcMain } from "electron";
// 暴露窗口操作到渲染进程
electron.contextBridge.exposeInMainWorld("windowControl", {
  minimize: () => electron.ipcRenderer.invoke("minimize"),
  maximize: () => electron.ipcRenderer.invoke("maximize"),
  hide: () => electron.ipcRenderer.invoke("hide"),
});

//暴露数据操作到渲染进程
electron.contextBridge.exposeInMainWorld("noteService", {
  //TODO: 传递参数的invoke/send
});
