import path from "path";
import { app } from "electron";

export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

export function isDebug(): boolean {
  const isDebug = true;
  return isDev() && isDebug;
}

export function getPreloadPath(): string {
  return path.join(app.getAppPath(), "./dist-electron/preload.cjs");
}
