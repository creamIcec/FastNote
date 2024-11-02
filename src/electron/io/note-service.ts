// 笔记i/o API -> CRUD
import sqlite3 from "sqlite3";
import { v4 as uuidv4 } from "uuid";

export type Note = {
  id: string;
  content: string;
};

export type NoteId = {
  id: string;
  name: string;
};

export class NoteService {
  private isDebug: boolean = false;
  private db: sqlite3.Database;

  public constructor(isDebug: boolean) {
    if (isDebug) {
      sqlite3.verbose();
    }
    this.isDebug = isDebug;
    this.db = new sqlite3.Database("notes.db");
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
  }

  public resetDatabase() {
    if (!this.isDebug) {
      throw new Error(
        "to prevent unintentional user data loss, reset database is not allowed if not debugging. To actually do this, please set isDebug to false first."
      );
    }
    this.db.run("DROP TABLE IF EXISTS note");
    this.db.run("DROP TABLE IF EXISTS noteId");
  }

  //笔记ID -> 数据库中对应的项目
  //内部转换函数, 该函数不暴露
  private async getEntryIdByName(name: string) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT id from noteId where name = ?`,
        [name],
        function (err, row: NoteId) {
          if (err) {
            return reject(err.message);
          }
          resolve(row.id);
        }
      );
    });
  }

  //数据库中对应的项目 -> 笔记ID
  //内部转换函数, 该函数不暴露
  private async getNameById(id: string) {
    return new Promise<string>((resolve, reject) => {
      this.db.get(
        `SELECT name from noteId where id = ?`,
        [id],
        function (err, row: NoteId) {
          if (err) {
            return reject(err.message);
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
    const id = this.getEntryIdByName(name);
    return new Promise((resolve, reject) =>
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

  //读取笔记
  public async readFromNote(name: string) {
    if (!this.db) {
      return;
    }
    const id = this.getEntryIdByName(name);
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT * FROM note WHERE id = ?`, [id], (err, row: Note) => {
        if (err) {
          return reject(err.message);
        }
        resolve(row.content);
      });
    });
  }

  //删除笔记项
  public deleteNote(name: string) {
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

  //增加笔记项
  public async addNote(name: string) {
    if (!this.db) {
      return;
    }
    //检查重名
    if (this.getEntryIdByName(name) !== null) {
      return new Promise((resolve, reject) => {
        reject(new Error("Duplicate note"));
      });
    }
    const id = NoteService.getNewId();
    return new Promise(async (resolve, reject) => {
      try {
        const _ = await this.writeToNoteList(id, name);
        const initialContent = ""; //新建的笔记默认内容为空字符串
        this.db.run(
          `INSERT INTO note VALUES (?, ?)`,
          [id, initialContent],
          function (err) {
            if (err) {
              return reject(err.message);
            }
            resolve("success");
          }
        );
      } catch (e) {
        return reject(e);
      }
    });
  }

  //重命名笔记项
  public renameNote(name: string, newName: string) {
    if (!this.db) {
      return;
    }
    //检查是否存在
    const id = this.getEntryIdByName(name);
    if (id === null) {
      return new Promise((resolve, reject) => {
        return reject(new Error("Note does not exist"));
      });
    }
    return new Promise((resolve, reject) =>
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

  //写入笔记列表
  //该函数不暴露, 外界通过增加笔记项/删除笔记来间接写入笔记列表
  private writeToNoteList(id: string, name: string) {
    if (!this.db) {
      return;
    }
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
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        const result: string[] = [];
        this.db.each("SELECT id, content FROM note", async (err, row: Note) => {
          if (err) {
            return reject(err.message);
          }
          try {
            result.push(await this.getNameById(row.id));
          } catch (e) {
            reject(e);
          }
        });
        resolve(result);
      });
    });
  }
}
