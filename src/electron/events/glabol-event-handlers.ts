import { BrowserWindow, globalShortcut } from "electron";

export function registerGlobalBringUpWindowShortCut(callback?: () => void) {
  const ret = globalShortcut.register("Meta+Alt+X", () => {
    console.log("Global keybind is pressed");
    callback?.();
  });

  if (!ret) {
    console.log("registration failed");
  }

  // 检查全局快捷键是否注册成功
  console.log(globalShortcut.isRegistered("Meta+Alt+X"));
}

export function unregisterGlobalBringUpWindowShortCut() {
  // 解除全局快捷键
  globalShortcut.unregister("Meta+Alt+X");

  // 解除所有全局快捷键
  //globalShortcut.unregisterAll();
}
