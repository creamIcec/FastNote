import { dialog } from "electron";
import fs from "node:fs";

export type ExternalSaveRecord = {
  state: boolean;
  payload: string;
};

async function setSavePath(innerName: string) {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "保存文件",
    defaultPath: `${innerName}.txt`,
    filters: [{ name: "文本文档", extensions: ["txt"] }],
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
      console.error("Failed to save file: ", e);
      reject(e);
    }
  });
}
