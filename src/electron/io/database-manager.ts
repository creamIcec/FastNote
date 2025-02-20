import sqlite3 from "sqlite3";
import path from "path";
import GetLogger from "../logger.js";
const logger = GetLogger(import.meta.url);

export class DatabaseManager {
  private db: sqlite3.Database;
  private readonly CURRENT_VERSION = 2; //current version of database

  constructor(db: sqlite3.Database) {
    this.db = db;
  }

  async initialize() {
    try {
    } catch (e) {}
  }

  private async createVersionTable(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        "CREATE TABLE IF NOT EXISTS db_version (version INTEGER)",
        (err: Error) => {
          if (err) reject(err);

          this.db.get(
            "SELECT version FROM db_version",
            (err: Error, row: any) => {
              if (err) reject(err);
              if (!row) {
                this.db.run(
                  "INSERT INTO db_version VALUES (?)",
                  [1],
                  (err: Error) => {
                    if (err) reject(err);
                    resolve();
                  }
                );
              } else {
                resolve();
              }
            }
          );
        }
      );
    });
  }

  private async getCurrentVersion(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT version FROM db_version", (err: Error, row: any) => {
        if (err) reject(err);
        resolve(row ? row.version : 1);
      });
    });
  }

  private async migrate(fromVersion: number): Promise<void> {
    if (fromVersion >= this.CURRENT_VERSION) {
      return;
    }
    for (let version = fromVersion; version < this.CURRENT_VERSION; version++) {
      await this.executeMigration(version);
    }

    await this.updateVersion(this.CURRENT_VERSION);
  }

  private async executeMigration(version: number): Promise<void> {
    switch (version) {
      case 1:
        await this.migrateV1ToV2();
        break;
      //Future migration operations add here
      default:
        break;
    }
  }

  private async migrateV1ToV2(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run("BEGIN TRANSACTION");

        this.db.run(`
                CREATE TABLE note_temp (
                    id TEXT,
                    create_time INTEGER,
                    content TEXT
                )`);
        this.db.run(`
                INSERT INTO note_temp (id, content, create_time)
                SELECT id, content, strftime('%s', 'now') * 1000
                FROM note
                `);
        this.db.run("DROP TABLE note");
        this.db.run("ALTER TABLE note_temp RENAME TO note");

        this.db.run("COMMIT", (err: Error) => {
          if (err) {
            this.db.run("ROLLBACK");
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  private async updateVersion(version: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        "UPDATE db_version SET version = ?",
        [version],
        (err: Error) => {
          if (err) reject(err);
          resolve();
        }
      );
    });
  }
}

export function getDatabase(app: Electron.App) {
  // 获取用户数据目录
  const userDataPath = app.getPath("userData");
  const dbPath = path.join(userDataPath, "notes.db");
  return new sqlite3.Database(dbPath);
}

export async function initDatabase(db: sqlite3.Database) {
  try {
    // 初始化基础表结构
    db.serialize(() => {
      db.run(
        "CREATE TABLE IF NOT EXISTS note (id TEXT, create_time INTEGER, content TEXT)"
      );
      db.run("CREATE TABLE IF NOT EXISTS noteId (id TEXT, name TEXT)");
      db.run("CREATE TABLE IF NOT EXISTS recentNote (id TEXT)", (err) => {
        if (err) {
          logger.error(`Unable to create recentNote table: `, err);
        }
        db.run(`INSERT INTO recentNote VALUES (?)`, [""], (e) => {
          if (e) {
            logger.error(`Unable to seed recentNote table: `, e);
          }
        });
      });
    });
  } catch (err) {
    logger.error("Database initialization failed:", err);
    throw err;
  }
}
