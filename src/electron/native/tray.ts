import { app, BrowserWindow, Menu, nativeImage, Tray } from "electron";
import path from "path";
import { isDev } from "../util.js";

import GetLogger from "../logger.js";
const logger = GetLogger(import.meta.url);

export function initializeTray() {
  //TODO: 从public中读取图标

  const iconPath = isDev()
    ? path.join(app.getAppPath(), "./dist-electron/resources/favicon-32x32.png")
    : path.join(
        app.getAppPath(),
        "./dist-electron/resources/favicon-32x32.png"
      );
  const icon = nativeImage.createFromPath(iconPath);
  const tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "保持窗口置顶",
      type: "checkbox",
      click: (menuItem, window, event) => {
        logger.info(`置顶:${menuItem.checked}`);
        const _window = BrowserWindow.getAllWindows()[0];
        logger.info(_window);
        _window?.setAlwaysOnTop(menuItem.checked, "pop-up-menu");
      },
    },
    {
      label: "退出程序",
      type: "normal",
      click: (menuItem, window, event) => {
        logger.info("退出程序");
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
