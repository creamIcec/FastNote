//接口列表

// 获取当前笔记的名称
export function getCurrentNoteName() {
  return "Title";
}

export async function saveRecentNoteName(name: string) {
  return await window.noteService.saveRecentTitle(name);
}

// 重命名笔记
export async function renameNote(noteName: string, newName: string) {
  return await window.noteService.renameNote(noteName, newName);
}

// 保存笔记名称
export function saveNoteName(noteId: string, name: string) {}

// 加载笔记列表
export function readNoteList() {}

// 保存笔记列表
export function saveNoteList() {}

// 保存笔记
export async function saveNote(noteName: string, content: string) {
  return await window.noteService.saveNote(noteName, content);
}

//保存到外部文件
export async function saveToExternalFile(noteName: string) {
  return await window.noteService.saveExternal(noteName);
}

// 加载笔记
export async function readNote(noteName: string) {
  return await window.noteService.readNote(noteName);
}

// 复制当前笔记内容到剪贴板
export function copyCurrentNoteContent() {
  return "Content";
}

// 创建新笔记
export function createNote() {
  return "noteid";
}

// 安排一段时间后的提醒
export function scheduleNotification(delay: number, message: string) {}

// 发送提醒通知
export function sendNotification(message: string) {}

// 最小化窗口
export function minimizeWindow() {
  window.windowControl.minimize();
}

// 最大化窗口
export function maximizeWindow() {
  window.windowControl.maximize();
}

// 隐藏窗口(最小化到托盘)
export function hideWindow() {
  window.windowControl.hide();
}

//TODO: 托盘显示图标
// 显示窗口
