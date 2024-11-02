import { Menu, nativeImage, Tray } from "electron";

export function initializeTray() {
  //TODO: 从public中读取图标

  const icon = nativeImage.createFromPath("favicon-32x32.png");
  const tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "退出程序",
      type: "normal",
      click: (menuItem, window, event) => {
        console.log("退出程序");
        window?.close();
        process.exit(0);
      },
    },
    { label: "保持窗口置顶", type: "checkbox" },
  ]);

  tray.setToolTip("This is my application.");
  tray.setContextMenu(contextMenu);

  return tray;
}

export function registerTrayClickEvent(tray: Tray, callback: () => void) {
  tray.on("click", () => {
    callback();
  });
}
