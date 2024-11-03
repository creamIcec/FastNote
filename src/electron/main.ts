import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { getPreloadPath, isDebug, isDev } from "./util.js";
import {
  registerDataEventHandlers,
  registerWindowCloseEventHandler,
  registryWindowEventHandlers,
} from "./events/event-handlers.js";
import {
  registerGlobalBringUpWindowShortCut,
  unregisterGlobalBringUpWindowShortCut,
} from "./events/glabol-event-handlers.js";
import { initializeTray, registerTrayClickEvent } from "./native/tray.js";
import { showWindow, toggleWindow } from "./actions/window-actions.js";
import { NoteService } from "./io/note-service.js";

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    width: 512,
    height: 650,
    minWidth: 270,
    minHeight: 512,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: getPreloadPath(),
    },
  });

  const debug = isDebug();

  //创建笔记服务对象
  const noteService = new NoteService(debug);

  if (debug) {
    mainWindow.webContents.openDevTools();
  }

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }

  //注册所有窗口控制事件监听
  registryWindowEventHandlers(mainWindow);

  //注册所有数据处理事件监听
  registerDataEventHandlers(noteService);

  //注册全局快捷键
  registerGlobalBringUpWindowShortCut(() => {
    toggleWindow(mainWindow);
  });

  //注册托盘图标及操作
  const tray = initializeTray();
  registerTrayClickEvent(tray, () => {
    showWindow(mainWindow);
  });

  //注册任务栏退出时重定向到缩小到托盘
  registerWindowCloseEventHandler(mainWindow);
});

app.on("will-quit", () => {
  // 解除所有全局快捷键
  unregisterGlobalBringUpWindowShortCut();
});
