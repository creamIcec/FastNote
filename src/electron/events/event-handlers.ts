import { BrowserWindow, ipcMain } from "electron";

export function registryIpcEventHandlers(window: BrowserWindow) {
  ipcMain.handle("minimize", () => {
    console.log("minimize");
    window.minimize();
  });

  ipcMain.handle("maximize", () => {
    console.log("maximize");
    window.maximize();
  });

  // 关闭窗口: 并不是关闭,而是隐藏到托盘
  ipcMain.handle("hide", () => {
    console.log("hide");
    window.hide();
  });
}

export function registerWindowCloseEventHandler(window: BrowserWindow) {
  window.on("close", (event) => {
    event.preventDefault();
    window.hide();
  });
}
