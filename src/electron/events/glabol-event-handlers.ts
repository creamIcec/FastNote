import { BrowserWindow, globalShortcut } from "electron";

import getLogger from "../logger.js";
const logger = getLogger(import.meta.url);

export function registerGlobalBringUpWindowShortCut(callback?: () => void) {
  const ret = globalShortcut.register("Meta+Alt+X", () => {
    logger.info("Global keybind is pressed");
    callback?.();
  });

  if (!ret) {
    logger.error("registration failed");
  }

  // 检查全局快捷键是否注册成功
  logger.info(globalShortcut.isRegistered("Meta+Alt+X"));
}

export function unregisterGlobalBringUpWindowShortCut() {
  // 解除全局快捷键
  globalShortcut.unregister("Meta+Alt+X");

  // 解除所有全局快捷键
  //globalShortcut.unregisterAll();
}
