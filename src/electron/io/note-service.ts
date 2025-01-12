// 笔记i/o API -> CRUD
import sqlite3 from "sqlite3";
import { v4 as uuidv4 } from "uuid";
import { ExternalSaveRecord, saveNativeFile } from "./fs-utils.js";
import { app } from "electron";
import path from "path";
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

export type PromiseContent = {
  state: boolean;
  payload: string;
};

//笔记服务对象
//什么时候切换"当前笔记"?
//用户在侧边栏里面点击一个 -> 保存到变量
//每次退出程序时 -> 保存到数据库
//每次启动程序时 -> 从数据库读取
export class NoteService {
  private isDebug: boolean = false;
  private db: sqlite3.Database;

  public constructor(isDebug: boolean) {
    if (isDebug) {
      sqlite3.verbose();
    }
    this.isDebug = isDebug;
    // 获取用户数据目录
    const userDataPath = app.getPath("userData");
    const dbPath = path.join(userDataPath, "notes.db");
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  private static getNewId() {
    return uuidv4();
  }

  private init() {
    if (!this.db) {
      return;
    }
    this.db.run("CREATE TABLE IF NOT EXISTS note (id TEXT, content TEXT)");
    this.db.run("CREATE TABLE IF NOT EXISTS noteId (id TEXT, name TEXT)");
    this.db.run("CREATE TABLE IF NOT EXISTS recentNote (id TEXT)", (err) => {
      if (err) {
        console.error(`Unable to create recentNote table: `, err);
      }
      this.db.run(`INSERT INTO recentNote VALUES (?)`, [""], (e) => {
        if (e) {
          console.error(`Unable to seed recentNote table: `, e);
        }
      });
    });
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
    console.log(`存在${name}对应id: ${id}, 开始写入...`);
    console.log(`写入内容:${content}`);
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
    if (!this.db) {
      return;
    }
    return new Promise<ExternalSaveRecord>(async (resolve, reject) => {
      if (!(await this.exists(name))) {
        return reject("Note does not exist, Please check if database exists.");
      }
      const id = await this.getEntryIdByName(name);
      this.db.get(
        `SELECT * FROM note WHERE id = ?`,
        [id],
        async (err, row: Note | undefined) => {
          if (err) {
            return reject(err.message);
          }
          if (!row) {
            return reject(
              "Note does not exist, Please check if database exists."
            );
          }
          //保存
          try {
            const result = await saveNativeFile(name, row.content);
            return resolve(result);
          } catch (e) {
            console.log("Cannot save to external file: ", e);
          }
        }
      );
    });
  }

  //读取笔记
  public async readFromNote(name: string) {
    if (!this.db) {
      return undefined;
    }
    const id = await this.getEntryIdByName(name);
    if (!id) {
      console.log(`不存在${name}, 返回undefined`);
      return undefined;
    }
    console.log(`存在${name}对应id: ${id}, 开始读取...`);
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
  //在启动程序时执行
  public async readRecentTitle() {
    if (!this.db) {
      return;
    }
    return new Promise<string | undefined>((resolve, reject) => {
      this.db.get(`SELECT * FROM recentNote`, async (err, row: RecentNote) => {
        console.log(row);
        console.log(`最近的笔记id:${row.id}`);
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
        console.log(`最近的笔记标题:${name}`);
        resolve(name);
      });
    });
  }

  //保存最近的笔记标题
  //在切换笔记时执行
  public async saveRecentTitle(name: string) {
    if (!this.db) {
      return;
    }
    const id = await this.getEntryIdByName(name);
    console.log(`正在保存新的最近标题:${id}`);
    return new Promise<string | undefined>((resolve, reject) => {
      this.db.get(
        `UPDATE recentNote SET id = ?`,
        [id],
        async (err, row: RecentNote) => {
          if (err) {
            return reject(err.message);
          }
          if (!row) {
            return resolve(undefined);
          }
          const name = await this.getNameById(row.id);
          resolve("success");
        }
      );
    });
  }

  //删除笔记项
  public async deleteNote(name: string) {
    if (!this.db) {
      return;
    }
    const id = this.getEntryIdByName(name);
    return new Promise((resolve, reject) => {
      this.db.run(`DELETE FROM note WHERE id = ?`, [id], function (err) {
        if (err) {
          return reject(err.message);
        }
        resolve("success");
      });
    });
  }

  //创建新笔记
  public async createNote(name: string) {
    if (!this.db) {
      return;
    }
    //检查重名
    if ((await this.getEntryIdByName(name)) !== undefined) {
      throw new Error("Duplicate note");
    }
    const id = NoteService.getNewId();
    return new Promise<PromiseContent>(async (resolve, reject) => {
      try {
        const _ = await this.writeToNoteList(id, name);
        const initialContent = "";
        this.db.run(
          `INSERT INTO note VALUES (?, ?)`,
          [id, initialContent],
          function (err) {
            if (err) {
              return reject(err.message);
            }
            resolve({ state: true, payload: name });
          }
        );
      } catch (e) {
        return reject(e);
      }
    });
  }

  //重命名笔记项
  public async renameNote(name: string, newName: string) {
    if (!this.db) {
      return;
    }
    //检查是否存在
    console.log(`尝试重命名${name} -> ${newName}`);
    const id = await this.getEntryIdByName(name);
    if (id === undefined) {
      throw new Error("Note does not exist");
    }
    console.log(`将${name}重命名成${newName}, id为${id}`);
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
    console.log("id:", id);
    return id !== undefined;
  }

  //写入笔记列表
  //该函数不暴露, 外界通过增加笔记项/删除笔记来间接写入笔记列表
  private async writeToNoteList(id: string, name: string) {
    if (!this.db) {
      return;
    }
    console.log(`写入笔记列表:${name}`);
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

  //应用退出时执行的清理操作
  //保存, 记录最后编辑的笔记
  public async onQuit() {}
}
