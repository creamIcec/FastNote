// 笔记i/o API -> CRUD
import sqlite3 from "sqlite3";
import { v4 as uuidv4 } from "uuid";
import { saveNativeFile } from "./fs-utils.js";

import getLogger from "../logger.js";
import { Msg } from "../types.js";
const logger = getLogger(import.meta.url);

import { escape } from "../utils/file-name-util.js";

export type Note = {
  id: string;
  content: string;
};

export type NoteId = {
  id: string;
  name: string;
};

export type RecentNote = {
  id: string;
};

//笔记服务对象
//什么时候切换"当前笔记"?
//用户在侧边栏里面点击一个 -> 保存到变量
//每次退出程序时 -> 保存到数据库
//每次启动程序时 -> 从数据库读取
export class NoteService {
  private isDebug: boolean = false;
  private db: sqlite3.Database;

  public constructor(isDebug: boolean, db: sqlite3.Database) {
    if (isDebug) {
      sqlite3.verbose();
    }
    this.isDebug = isDebug;
    this.db = db;
  }

  private static getNewId() {
    return uuidv4();
  }

  private static getCreatedTime() {
    return Date.now();
  }

  public resetDatabase() {
    if (!this.isDebug) {
      throw new Error(
        "to prevent unintentional user data loss, reset database is not allowed if not debugging. To actually do this, please set isDebug to false first."
      );
    }
    this.db.run("DROP TABLE IF EXISTS note");
    this.db.run("DROP TABLE IF EXISTS noteId");
    this.db.run("DROP TABLE IF EXISTS recentNote");
  }

  private async getNote(id: string) {
    return new Promise<string>((resolve, reject) =>
      this.db.get(
        `SELECT * FROM note WHERE id = ?`,
        [id],
        (err, row: Note | undefined) => {
          if (err) {
            return reject(err);
          }
          if (!row) {
            return reject(new Error("Note not found!"));
          }
          resolve(row.content);
        }
      )
    );
  }

  private async insertToNote(
    id: string,
    createdTime: number,
    initialContent: string
  ) {
    return new Promise((resolve, reject) =>
      this.db.run(
        `INSERT INTO note VALUES (?, ?, ?)`,
        [id, createdTime, initialContent],
        function (err) {
          if (err) {
            return reject(err.message);
          }
          resolve({ state: true, payload: undefined });
        }
      )
    );
  }

  //笔记ID -> 数据库中对应的项目
  //内部转换函数, 该函数不暴露
  private async getEntryIdByName(name: string) {
    return new Promise<string | undefined>((resolve, reject) => {
      this.db.get(
        `SELECT id from noteId where name = ?`,
        [name],
        function (err, row: NoteId | undefined) {
          if (err) {
            return reject(err.message);
          }
          if (!row) {
            return resolve(undefined);
          }
          resolve(row.id);
        }
      );
    });
  }

  //数据库中对应的项目 -> 笔记ID
  //内部转换函数, 该函数不暴露
  private async getNameById(id: string) {
    return new Promise<string | undefined>((resolve, reject) => {
      this.db.get(
        `SELECT name from noteId where id = ?`,
        [id],
        function (err, row: NoteId | undefined) {
          if (err) {
            return reject(err.message);
          }
          if (!row) {
            return resolve(undefined);
          }
          resolve(row.name);
        }
      );
    });
  }

  //写入笔记
  public async writeToNote(name: string, content: string) {
    if (!this.db) {
      return;
    }
    const id = await this.getEntryIdByName(name);
    logger.info(`${name} corresponding id exists, writing started...`);
    return new Promise<string>((resolve, reject) =>
      this.db.run(
        `UPDATE note SET content = ? WHERE id = ?`,
        [content, id],
        (err) => {
          if (err) {
            return reject(err.message);
          }
          resolve("success");
        }
      )
    );
  }

  //保存至外部文件
  public async saveToExternalFile(name: string) {
    const escapedName = escape(name);
    const id = await this.getEntryIdByName(name);
    if (!id || !this.db || !(await this.exists(name))) {
      return;
    }
    const noteContent = await this.getNote(id);
    //保存
    try {
      const result = await saveNativeFile(escapedName, noteContent);
      return result;
    } catch (e) {
      logger.error(`Failed to save to external file: ${e}`);
      return { state: false, payload: (e as Error).message };
    }
  }

  //读取笔记
  public async readFromNote(name: string) {
    if (!this.db) {
      return undefined;
    }
    const id = await this.getEntryIdByName(name);
    if (!id) {
      logger.warn(`${name} does not exist, returning undefined`);
      return undefined;
    }
    logger.info(`${name} corresponding id exists, reading started...`);
    return new Promise<string | undefined>((resolve, reject) => {
      this.db.get(
        `SELECT * FROM note WHERE id = ?`,
        [id],
        (err, row: Note | undefined) => {
          if (err) {
            return reject(err.message);
          }
          if (!row) {
            return resolve(undefined);
          }
          resolve(row.content);
        }
      );
    });
  }

  //读取最近的笔记标题
  //读取最近的笔记标题
  //在启动程序时执行
  public async readRecentTitle() {
    if (!this.db) {
      return;
    }
    return new Promise<string | undefined>((resolve, reject) => {
      this.db.get(`SELECT * FROM recentNote`, async (err, row: RecentNote) => {
        const name = await this.getNameById(row.id);
        if (err) {
          return reject(err.message);
        }
        if (!row) {
          return resolve(undefined);
        }
        if (row.id === "") {
          return resolve(undefined);
        }
        logger.info(`Recent used note title:${name}`);
        resolve(name);
      });
    });
  }

  //保存最近的笔记标题
  //在切换笔记时执行
  public async saveRecentTitle(name: string): Promise<Msg> {
    if (!this.db) {
      return {
        state: false,
        payload: "Database is not connected, please try reloading app",
      };
    }
    const id = await this.getEntryIdByName(name);
    logger.info(`Saving new recent used note title`);
    return new Promise<Msg>((resolve, reject) => {
      this.db.get(
        `UPDATE recentNote SET id = ?`,
        [id],
        async (err, row: RecentNote) => {
          if (err) {
            return reject(err.message);
          }
          if (!row) {
            return resolve({ state: false, payload: undefined });
          }
          await this.getNameById(row.id);
          resolve({ state: true, payload: undefined });
        }
      );
    });
  }

  //删除笔记项
  public async deleteNote(name: string): Promise<Msg> {
    if (!name || typeof name !== "string") {
      throw new Error("Invalid name parameter");
    }
    logger.info(`Start Deleting: ${name}`);
    if (!this.db) {
      logger.error("Delete not succeed: database not connected");
      throw new Error("Database not connected");
    }
    try {
      const id = await this.getEntryIdByName(name);
      if (!id) {
        logger.error(
          `Delete not succeed: name ${name} does not match any note in database. Please check whether it exists.`
        );
        return {
          state: false,
          payload: `name '${name}' does not match any note in database. Please check whether it exists.`,
        };
      }
      await new Promise((resolve, reject) => {
        this.db.run("BEGIN TRANSACTION");
        this.db.run(`DELETE FROM noteId WHERE id = ?`, [id], (err) => {
          if (err) {
            this.db.run("ROLLBACK");
            reject({
              state: false,
              payload: "error occured, id not exists.",
            });
          }
        });
        this.db.run(`DELETE FROM note WHERE id = ?`, [id], (err) => {
          if (err) {
            this.db.run("ROLLBACK");
            reject({
              state: false,
              payload: "error occured, id not exists.",
            });
          } else {
            this.db.run("COMMIT");
            resolve({
              state: true,
              payload: "success",
            });
          }
        });
      });
      logger.info(`Successfully deleted note: ${name}`);
      return { state: true, payload: "success" };
    } catch (error) {
      logger.error(`Error deleting note: ${error}`);
      return { state: false, payload: `Error occurred: ${error}` };
    }
  }

  //创建新笔记
  public async createNote(name: string): Promise<Msg> {
    if (!this.db) {
      return {
        state: false,
        payload: "Database is not connected, please try reloading app",
      };
    }
    //检查重名
    if ((await this.getEntryIdByName(name)) !== undefined) {
      throw new Error("笔记重复");
    }
    const id = NoteService.getNewId();
    const createdTime = NoteService.getCreatedTime();
    const initialContent = "";
    try {
      await this.insertToNote(id, createdTime, initialContent);
      await this.writeToNoteList(id, name);
      return { state: true, payload: undefined };
    } catch (e) {
      return { state: false, payload: (e as Error).message };
    }
  }

  //重命名笔记项
  public async renameNote(name: string, newName: string) {
    if (!this.db) {
      return;
    }
    //检查是否存在
    logger.info(`Try renaming${name} -> ${newName}`);
    const id = await this.getEntryIdByName(name);
    logger.info(`id read for renaming: ${id}`);
    if (id === undefined) {
      throw new Error("Note does not exist");
    }
    logger.info(`Renaming ${name} to ${newName}`);
    return new Promise<string>((resolve, reject) =>
      this.db.run(
        `UPDATE noteId SET name = ? WHERE id = ?`,
        [newName, id],
        (err) => {
          if (err) {
            return reject(err.message);
          }
          resolve("success");
        }
      )
    );
  }

  //检查是否存在一条笔记
  public async exists(name: string) {
    const id = await this.getEntryIdByName(name);
    logger.info(`${name} corresponding id exists`);
    return id !== undefined;
  }

  //写入笔记列表
  //该函数不暴露, 外界通过增加笔记项/删除笔记来间接写入笔记列表
  private async writeToNoteList(id: string, name: string) {
    if (!this.db) {
      return;
    }
    logger.info(`writing note "${name}" to list`);
    return new Promise<string>((resolve, reject) => {
      this.db.run(
        `INSERT INTO noteId VALUES (?, ?)`,
        [id, name],
        function (err) {
          if (err) {
            return reject(err.message);
          }
          resolve("success");
        }
      );
    });
  }

  //读取笔记列表
  public async readNoteList() {
    if (!this.db) {
      return;
    }
    return new Promise<string[]>((resolve, reject) => {
      this.db.all("SELECT id, name FROM noteId", (err, rows: NoteId[]) => {
        if (err) {
          return reject(err.message);
        }
        const result = rows.map((row) => row.name); // 将所有 `name` 提取出来
        resolve(result); // 确保在所有数据读取后返回结果
      });
    });
  }

  //读取笔记列表中排序在最后的笔记名称
  public async readLastNameInList() {
    if (!this.db) {
      return;
    }
    logger.info("Reading the last note from list");
    return new Promise<Msg | undefined>((resolve, reject) => {
      this.db.get(
        `SELECT name FROM note t1
         INNER JOIN noteId t2 ON t1.id=t2.id
         ORDER BY t1.create_time DESC
         LIMIT 1`,
        (err, row: NoteId | undefined) => {
          if (err) {
            logger.error(err);
            return reject({ state: false, payload: err.message });
          }
          if (!row) {
            logger.error("no last item data");
            return resolve({ state: false, payload: undefined });
          }
          resolve({ state: true, payload: row.name });
        }
      );
    });
  }

  //应用退出时执行的清理操作
  //保存, 记录最后编辑的笔记
  public async onQuit() {}
}
