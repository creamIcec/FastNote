import { dialog } from "electron";
import fs from "node:fs";

import GetLogger from "../logger.js";
import { t } from "i18next";
const logger = GetLogger(import.meta.url);

export type ExternalSaveRecord = {
  state: boolean;
  payload: string;
};

async function setSavePath(innerName: string) {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: t("save_external"),
    defaultPath: `${innerName}.txt`,
    filters: [{ name: t("format_txt"), extensions: ["txt"] }],
  });

  if (canceled) return null;
  return filePath; // 返回用户选择的完整文件路径
}

export async function saveNativeFile(fileName: string, content: string) {
  const savePath = await setSavePath(fileName);
  return new Promise<ExternalSaveRecord>((resolve, reject) => {
    if (!savePath) {
      return reject("Please specify file saving path");
    }
    try {
      fs.writeFileSync(savePath, content, "utf-8");
      resolve({ state: true, payload: savePath });
    } catch (e) {
      logger.error(`Failed to save to external file: ${e}`);
      reject(e);
    }
  });
}
