import { BrowserWindow } from "electron";

export function toggleWindow(window: BrowserWindow) {
  if (window.isVisible()) {
    window.hide();
  } else {
    window.show();
  }
}

export function showWindow(window: BrowserWindow) {
  window.show();
}
