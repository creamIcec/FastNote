//接口列表

// 获取当前笔记的名称
export function getCurrentNoteName() {
  return "Title";
}

// 重命名笔记
export function renameNote(noteId: string, newName: string) {}

// 保存笔记名称
export function saveNoteName(noteId: string, name: string) {}

// 加载笔记列表
export function loadNoteList() {}

// 保存笔记列表
export function saveNoteList() {}

// 保存笔记
export function saveNote(noteId: string, content: string) {}

// 加载笔记
export function loadNote(noteId: string) {
  return "Content";
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
