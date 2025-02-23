import { app, BrowserWindow } from "electron";
import path from "path";
import { getPreloadPath, isDebug, isDev } from "./environment-util.js";
import {
  registerDataEventHandlers,
  registerI18nEventEmits,
  registerI18nEventHandlers,
  registerNotificationEventHandlers,
  registerWindowCloseEventHandler,
  registerWindowEventEmits,
  registerWindowEventHandlers,
} from "./events/event-handlers.js";
import {
  registerGlobalBringUpWindowShortCut,
  unregisterGlobalBringUpWindowShortCut,
} from "./events/glabol-event-handlers.js";
import {
  initializeTray,
  registerTrayClickEvent,
  updateTrayMenu,
} from "./native/tray.js";
import { showWindow, toggleWindow } from "./actions/window-actions.js";
import { NoteService } from "./io/note-service.js";
import { NotificationService } from "./io/notification-service.js";
import { ConfigManager } from "./io/config-manager.js";
import {
  DatabaseManager,
  getDatabase,
  initDatabase,
} from "./io/database-manager.js";
import { i18next, initI18n } from "./configs/i18next.config.js";

app.on("ready", async () => {
  const mainWindow = new BrowserWindow({
    width: 512,
    height: 650,
    minWidth: 304,
    minHeight: 320,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: getPreloadPath(),
    },
  });

  const debug = isDebug();

  //创建数据库对象
  const db = getDatabase(app);
  //创建数据库管理对象, 用于版本兼容
  const databaseManger = new DatabaseManager(db);
  await databaseManger.initialize();
  await initDatabase(db);
  //创建笔记服务对象
  const noteService = new NoteService(debug, db);
  //创建通知服务对象
  const notificationService = new NotificationService();

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }

  if (debug) {
    mainWindow.on("ready-to-show", () => {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    });
  }

  //创建配置管理器
  //确保在其他所有的最前方:)
  const configManager = await ConfigManager.createConfigManager();
  await configManager.initialize();

  //注册所有i18n后端事件监听
  registerI18nEventHandlers(i18next);

  //启动i18n引擎
  await initI18n();

  //注册所有窗口控制事件监听
  registerWindowEventHandlers(mainWindow);

  //注册所有窗口发出事件监听
  registerWindowEventEmits(mainWindow);

  //注册所有数据处理事件监听
  registerDataEventHandlers(noteService);

  //注册通知处理事件监听
  registerNotificationEventHandlers(mainWindow, notificationService);

  //注册全局快捷键
  registerGlobalBringUpWindowShortCut(() => {
    toggleWindow(mainWindow);
  });

  //注册托盘图标及操作
  const tray = initializeTray();
  registerTrayClickEvent(tray, () => {
    showWindow(mainWindow);
  });

  //注册i18n语言变化事件触发
  registerI18nEventEmits(i18next, (code) => {
    configManager.config!.language = code;
    configManager.saveConfig();
    updateTrayMenu(tray);
  });

  //注册任务栏退出时重定向到缩小到托盘
  registerWindowCloseEventHandler(mainWindow);
});

app.on("will-quit", () => {
  // 解除所有全局快捷键
  unregisterGlobalBringUpWindowShortCut();
});
