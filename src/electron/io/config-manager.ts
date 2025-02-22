import { app } from "electron";
import path from "path";
import fs from "node:fs";
import Ajv from "ajv";
import GetLogger from "../logger.js";
const logger = GetLogger(import.meta.url);

export interface Config {
  globalShortcut: string;
}

export class ConfigManager {
  private configPath: string;
  config: Config | null;
  private ajv;
  private static configManager: ConfigManager;
  private schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      globalShortcut: {
        type: "string",
        description: "Global Shortcut for bringing up window.",
      },
    },
    required: ["globalShortcut"],
  };

  private constructor() {
    this.ajv = new Ajv();
    this.configPath = path.join(app.getPath("userData"), "settings.json");
    this.config = null;
  }

  public async initialize() {
    try {
      this.config = await this.loadConfig();
      return this;
    } catch (error) {
      logger.error("Config initialization failed:", error);
      this.config = this.getDefaultConfig();
      return this;
    }
  }

  private async validateJSON(json: unknown): Promise<boolean> {
    if (!json) {
      return false;
    }
    const valid = await this.ajv.validate(this.schema, json);
    if (!valid) {
      logger.warn(
        "Config is invalid, restoring default config: ",
        this.ajv.errorsText()
      );
    } else {
      logger.info("Config validated");
    }
    return valid;
  }

  //反序列化
  private async loadConfig(): Promise<Config> {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, "utf8");
        const json = JSON.parse(data);
        if (await this.validateJSON(json)) {
          return json as Config;
        }
        return this.getDefaultConfig();
      }
      return this.getDefaultConfig();
    } catch (e) {
      logger.error(`Failed to load config:${e}`);
      return this.getDefaultConfig();
    }
  }

  //序列化
  public saveConfig() {
    try {
      //先保存至临时文件, 尽量避免直接操作导致的问题
      const tempPath = `${this.configPath}.temp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.config, null, 2));

      //保存完成后，再替换原来的文件
      fs.renameSync(tempPath, this.configPath);
      logger.info(`Config saved successfully`);
      return true;
    } catch (e) {
      logger.error(`Failed to save config:${e}`);
      return false;
    }
  }

  private getDefaultConfig(): Config {
    return {
      globalShortcut: "Meta+Alt+X",
    };
  }

  public static async createConfigManager() {
    const configManager = new ConfigManager();
    ConfigManager.configManager = configManager;
    return configManager;
  }

  public static getInstance() {
    return ConfigManager.configManager;
  }
}
