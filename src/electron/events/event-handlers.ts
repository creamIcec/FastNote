import { BrowserWindow, ipcMain } from "electron";
import { NoteService } from "../io/note-service.js";

export function registryWindowEventHandlers(window: BrowserWindow) {
  ipcMain.handle("minimize", () => {
    console.log("minimize");
    window.minimize();
  });

  ipcMain.handle("maximize", () => {
    console.log("maximize");
    window.maximize();
  });

  // 关闭窗口: 并不是关闭,而是隐藏到托盘
  ipcMain.handle("hide", () => {
    console.log("hide");
    window.hide();
  });
}

export function registerWindowCloseEventHandler(window: BrowserWindow) {
  window.on("close", (event) => {
    event.preventDefault();
    window.hide();
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
    console.log(`读取内容:${content}`);
    return content !== undefined ? content : undefined;
  });

  ipcMain.handle("note:saveExternal", async (event, name: string) => {
    try {
      const result = await noteService.saveToExternalFile(name);
      if (result && result.state) {
        console.log(`已保存到外部文件, 路径: ${result.payload}`);
        return result.payload;
      }
    } catch (e) {
      console.log(`保存时遇到错误:${e}`);
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
        console.log(`重命名时遇到错误:${e}`);
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
      console.log("创建时遇到错误:", e);
      return e;
    }
  });

  ipcMain.handle("notelist:read", async (event) => {
    try {
      const list = await noteService.readNoteList();
      console.log(`笔记列表:${list}`);
      if (list) {
        return list;
      }
      return [];
    } catch (e) {
      console.log("读取笔记列表时遇到错误:", e);
      return e;
    }
  });
}
