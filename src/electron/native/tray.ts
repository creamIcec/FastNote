import { BrowserWindow, Menu, nativeImage, Tray } from "electron";

export function initializeTray() {
  //TODO: 从public中读取图标

  const icon = nativeImage.createFromPath("favicon-32x32.png");
  const tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "保持窗口置顶",
      type: "checkbox",
      click: (menuItem, window, event) => {
        console.log(`置顶:${menuItem.checked}`);
        const _window = BrowserWindow.getAllWindows()[0];
        console.log(_window);
        _window?.setAlwaysOnTop(menuItem.checked, "pop-up-menu");
      },
    },
    {
      label: "退出程序",
      type: "normal",
      click: (menuItem, window, event) => {
        console.log("退出程序");
        window?.close();
        process.exit(0);
      },
    },
  ]);

  tray.setToolTip("FastNote");
  tray.setContextMenu(contextMenu);

  return tray;
}

export function registerTrayClickEvent(tray: Tray, callback: () => void) {
  tray.on("click", () => {
    callback();
  });
}
