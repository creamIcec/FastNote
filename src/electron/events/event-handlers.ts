import { BrowserWindow, ipcMain, shell } from "electron";
import { NoteService } from "../io/note-service.js";
import {
  NotificationItem,
  NotificationService,
} from "../io/notification-service.js";

import i18next from "i18next";

import getLogger from "../logger.js";
import { modifyGlobalBringUpWindowShortcut } from "./glabol-event-handlers.js";
import { LinkTarget } from "../types.js";
import { showWindow } from "../actions/window-actions.js";
import { languageConfig } from "../configs/i18next.config.js";
const logger = getLogger(import.meta.url);

export function registerWindowEventHandlers(window: BrowserWindow) {
  ipcMain.handle("minimize", () => {
    logger.info("Window Minimized");
    window.minimize();
  });

  ipcMain.handle("maximize", () => {
    logger.info("Window Maximized");
    window.maximize();
  });

  // 关闭窗口: 并不是关闭,而是隐藏到托盘
  ipcMain.handle("hide", () => {
    logger.info("Window minized to system tray");
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
    logger.info(`Successfully read note content`);
    return content !== undefined ? content : undefined;
  });

  ipcMain.handle("note:saveExternal", async (_, name: string) => {
    const result = await noteService.saveToExternalFile(name);
    if (result && result.state) {
      logger.info(
        `Successfully saved to external file path: ${result.payload}`
      );
      return result.payload;
    }
    return result?.payload;
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
        logger.error(`Error occured when try to rename:${e}`);
        return e;
      }
    }
  );

  ipcMain.handle("note:readRecentTitle", async () => {
    const name = await noteService.readRecentTitle();
    if (name) {
      return name;
    }
    return undefined;
  });

  ipcMain.handle("note:saveRecentTitle", async (event, name) => {
    try {
      const result = await noteService.saveRecentTitle(name);
      if (result && result.state) {
        return true;
      }
      return false;
    } catch (e) {
      logger.error(
        `Failed to save recent used note title: ${(e as Error).message}`
      );
      return false;
    }
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
      logger.error("Error occurred when creating note:", e);
      return false;
    }
  });

  ipcMain.handle("notelist:read", async () => {
    try {
      const list = await noteService.readNoteList();
      logger.info(`Note list:${list}`);
      if (list) {
        return list;
      }
      return [];
    } catch (e) {
      logger.error("Error occurred when reading note list:", e);
      return [];
    }
  });

  ipcMain.handle("note:delete", async (_, name) => {
    try {
      //不存在这个笔记, 无需删除
      if (!(await noteService.exists(name))) {
        return false;
      }
      const result = await noteService.deleteNote(name);
      logger.info(`Deletion result: ${result.state ? "success" : "failed"}`);
      return result.state;
    } catch (e) {
      logger.error("Error occurred when deleting note:", e);
      return false;
    }
  });

  ipcMain.handle("note:readLastNameInList", async () => {
    try {
      const result = await noteService.readLastNameInList();
      if (!result || !result.state) {
        return undefined;
      }
      logger.info(`Last note in list:${result}`);
      return result.payload;
    } catch (e) {
      logger.warn(`Unable to read the last note in list: ${e}`);
    }
  });

  ipcMain.handle("shortcut:applyShortcut", (event, shortcut?: string[]) => {
    const accelerator = shortcut ? shortcut.join("+") : undefined;
    const result = modifyGlobalBringUpWindowShortcut(accelerator);
    return result;
  });

  ipcMain.handle("external:openLink", (event, link: LinkTarget) => {
    switch (link) {
      case "svgrepo": {
        shell.openExternal("https://www.svgrepo.com");
        break;
      }
      case "github": {
        shell.openExternal("https://github.com/creamIcec/FastNote");
        break;
      }
      case "material3": {
        shell.openExternal("https://m3.material.io/");
        break;
      }
      default:
        break;
    }
  });
}

//通知事件处理器
export function registerNotificationEventHandlers(
  window: BrowserWindow,
  notificationService: NotificationService
) {
  ipcMain.handle("notification:set", async (event, delay, name, content?) => {
    logger.info(`Notification delay set: ${delay} ms`);
    notificationService.enqueue(
      new NotificationItem(content, name, delay, (e) => {
        showWindow(window);
      })
    );
  });
}

//翻译后端事件处理器
export function registerI18nEventHandlers(i18n: typeof i18next) {
  i18n.on("loaded", (loaded) => {
    i18n.changeLanguage("en");
    i18n.off("loaded");
  });

  ipcMain.handle("i18n:getInitialTranslations", () => {
    return i18n.getResourceBundle("en", "translation");
  });

  ipcMain.handle("i18n:getLanguages", () => {
    return {
      languages: languageConfig.languages,
      languageMap: languageConfig.languageMap,
    };
  });

  ipcMain.handle("i18n:changeLanguage", async (event, langCode) => {
    i18n.changeLanguage(langCode);
    return i18n.getResourceBundle(langCode, "translation");
  });

  ipcMain.handle("i18n:getCurrentLanguage", async () => {
    return i18n.language;
  });
}

export function registerI18nEventEmits(
  i18n: typeof i18next,
  callback: (code: string) => void
) {
  i18n.on("languageChanged", (code) => {
    callback(code);
  });
}
