import { globalShortcut } from "electron";

import getLogger from "../logger.js";
import { ConfigManager } from "../io/config-manager.js";
const logger = getLogger(import.meta.url);

export type GlobalShortcutState = {
  accelerator: string;
  callback: () => void;
};

const defaultAccelerator = "Meta+Alt+X";

export const globalShortcutState: GlobalShortcutState = {
  accelerator: defaultAccelerator,
  callback() {},
};

function triggerSaveConfig() {
  //写入配置管理器
  const configManager = ConfigManager.getInstance();

  configManager.config!.globalShortcut = globalShortcutState.accelerator;
  const result = configManager.saveConfig();
  if (result) {
    logger.info(
      `全局快捷键保存, 当前快捷键:${globalShortcutState.accelerator}`
    );
  }
}

export function registerGlobalBringUpWindowShortCut(callback?: () => void) {
  if (callback) {
    globalShortcutState.callback = callback;
  }
  const configManager = ConfigManager.getInstance();
  globalShortcutState.accelerator = configManager.config!.globalShortcut;
  const ret = globalShortcut.register(globalShortcutState.accelerator, () => {
    logger.info("Global keybind is pressed");
    globalShortcutState.callback();
  });

  if (!ret) {
    logger.error("registration failed");
  }

  // 检查全局快捷键是否注册成功
  logger.info(
    `全局快捷键注册状态: ${globalShortcut.isRegistered(
      globalShortcutState.accelerator
    )}`
  );
}

export function unregisterGlobalBringUpWindowShortCut() {
  // 解除全局快捷键
  globalShortcut.unregister(globalShortcutState.accelerator);
}

export function modifyGlobalBringUpWindowShortcut(newShortcut?: string) {
  logger.info(`用户设置新的快捷键: ${newShortcut}`);
  newShortcut = newShortcut || defaultAccelerator;
  globalShortcut.unregister(globalShortcutState.accelerator);
  const ret = globalShortcut.register(
    newShortcut,
    globalShortcutState.callback
  );
  if (ret) {
    globalShortcutState.accelerator = newShortcut;
  } else {
    globalShortcut.register(defaultAccelerator, globalShortcutState.callback);
  }

  triggerSaveConfig();

  return ret;
}
