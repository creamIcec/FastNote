import { BrowserWindow, ipcMain } from "electron";
import { NoteService } from "../io/note-service.js";
import {
  NotificationItem,
  NotificationService,
} from "../io/notification-service.js";
import { escape } from "../utils/file-name-util.js";

import getLogger from "../logger.js";
import { modifyGlobalBringUpWindowShortcut } from "./glabol-event-handlers.js";
const logger = getLogger(import.meta.url);

export function registerWindowEventHandlers(window: BrowserWindow) {
  ipcMain.handle("minimize", () => {
    logger.info("窗口最小化");
    window.minimize();
  });

  ipcMain.handle("maximize", () => {
    logger.info("窗口最大化");
    window.maximize();
  });

  // 关闭窗口: 并不是关闭,而是隐藏到托盘
  ipcMain.handle("hide", () => {
    logger.info("窗口最小化到托盘");
    window.hide();
  });
}

export function registerWindowCloseEventHandler(window: BrowserWindow) {
  window.on("close", (event) => {
    event.preventDefault();
    window.hide();
  });
}

export function registerWindowEventEmits(window: BrowserWindow) {
  window.on("show", () => {
    window.webContents.send("window:show");
  });
}

//数据事件处理器
export function registerDataEventHandlers(noteService: NoteService) {
  ipcMain.handle("note:save", async (event, name: string, content: string) => {
    let result;
    if (!(await noteService.exists(name))) {
      result = await noteService.createNote(name);
      if (!result) {
        return undefined;
      }
    }
    result = await noteService.writeToNote(name, content);
    return result === "success";
  });

  ipcMain.handle("note:read", async (event, name: string) => {
    const content = await noteService.readFromNote(name);
    logger.info(`读取内容:${content}`);
    return content !== undefined ? content : undefined;
  });

  ipcMain.handle("note:saveExternal", async (event, name: string) => {
    try {
      const result = await noteService.saveToExternalFile(name);
      if (result && result.state) {
        logger.info(`已保存到外部文件, 路径: ${result.payload}`);
        return result.payload;
      }
    } catch (e) {
      logger.error(`保存时遇到错误:${e}`);
      return e;
    }
  });

  ipcMain.handle(
    "note:rename",
    async (event, oldName: string, newName: string) => {
      try {
        const result = await noteService.renameNote(oldName, newName);
        if (result && result === "success") {
          return true;
        }
      } catch (e) {
        logger.error(`重命名时遇到错误:${e}`);
        return e;
      }
    }
  );

  ipcMain.handle("note:readRecentTitle", async (event) => {
    const name = await noteService.readRecentTitle();
    if (name) {
      return name;
    }
    return undefined;
  });

  ipcMain.handle("note:saveRecentTitle", async (event, name) => {
    const result = await noteService.saveRecentTitle(name);
    if (result && result === "success") {
      return true;
    }
    return false;
  });

  ipcMain.handle("note:create", async (event, name) => {
    try {
      if (await noteService.exists(name)) {
        return false;
      }
      const result = await noteService.createNote(name);
      if (!result) {
        return false;
      }
      return result.state;
    } catch (e) {
      logger.error("创建时遇到错误:", e);
      return false;
    }
  });

  ipcMain.handle("notelist:read", async (event) => {
    try {
      const list = await noteService.readNoteList();
      logger.info(`笔记列表:${list}`);
      if (list) {
        return list;
      }
      return [];
    } catch (e) {
      logger.error("读取笔记列表时遇到错误:", e);
      return [];
    }
  });

  ipcMain.handle("note:delete", async (event, name) => {
    try {
      //不存在这个笔记, 无需删除
      if (!(await noteService.exists(name))) {
        return false;
      }
      const result = await noteService.deleteNote(name);
      logger.info(`删除结果: ${result.state ? "成功" : "失败"}`);
      return result.state;
    } catch (e) {
      logger.error("删除时遇到错误:", e);
      return false;
    }
  });

  ipcMain.handle("note:readLastNameInList", async (event) => {
    try {
      const result = (await noteService.readLastNameInList()) as any;
      logger.info(`读取的列表中最后一项:${result}`);
      if (!result.state) {
        return undefined;
      }
      return result.payload;
    } catch (e) {}
  });

  ipcMain.handle("shortcut:applyShortcut", (event, shortcut?: string[]) => {
    const accelerator = shortcut ? shortcut.join("+") : undefined;
    const result = modifyGlobalBringUpWindowShortcut(accelerator);
    return result;
  });
}

//通知事件处理器
export function registerNotificationEventHandlers(
  notificationService: NotificationService
) {
  ipcMain.handle("notification:set", async (event, delay, name, content?) => {
    logger.info(`设置的通知延迟: ${delay}`);
    notificationService.enqueue(new NotificationItem(content, name, delay));
  });
}
