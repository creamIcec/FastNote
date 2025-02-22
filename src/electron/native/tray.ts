import { app, BrowserWindow, Menu, nativeImage, Tray } from "electron";
import path from "path";
import { isDev } from "../environment-util.js";

import GetLogger from "../logger.js";
import { t } from "i18next";
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

  updateTrayMenu(tray);

  return tray;
}

export function updateTrayMenu(tray: Tray) {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: t("keep_window_on_top"),
      type: "checkbox",
      click: (menuItem) => {
        logger.info(`Always on top state:${menuItem.checked}`);
        const _window = BrowserWindow.getAllWindows()[0];
        logger.info(_window);
        _window?.setAlwaysOnTop(menuItem.checked, "pop-up-menu");
      },
    },
    {
      label: t("exit_app"),
      type: "normal",
      click: (_, window) => {
        logger.info("Exiting");
        window?.close();
        process.exit(0);
      },
    },
  ]);

  tray.setToolTip("FastNote");
  tray.setContextMenu(contextMenu);
}

export function registerTrayClickEvent(tray: Tray, callback: () => void) {
  tray.on("click", () => {
    callback();
  });
}
