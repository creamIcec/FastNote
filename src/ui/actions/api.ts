//接口列表

import { getCurrentHour, getCurrentMinute, getDelay } from "../utils/datetime";

// 获取当前笔记的名称
export async function readRecentTitle() {
  return await window.noteService.readRecentTitle();
}

//保存当前编辑的笔记名称
export async function saveRecentNoteName(name: string) {
  return await window.noteService.saveRecentTitle(name);
}

// 重命名笔记
export async function renameNote(noteName: string, newName: string) {
  return await window.noteService.renameNote(noteName, newName);
}

// 加载笔记列表
export async function readNoteList() {
  return await window.noteService.readNoteList();
}

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
export function copyCurrentNoteContent(content: string) {
  return navigator.clipboard.writeText(content);
}

// 创建新笔记
export async function createNote(name: string) {
  return await window.noteService.createNote(name);
}

// 删除笔记
export async function deleteNote(name: string) {
  return await window.noteService.deleteNote(name);
}

// 读取最后一条笔记名称
export async function readLastNoteNameInList() {
  return await window.noteService.readLastNameInList();
}

// 安排一段时间后的提醒
export async function scheduleNotification(
  target: string,
  title: string,
  content: string
) {
  const delay = getDelay(`${getCurrentHour()}:${getCurrentMinute()}`, target); //获取毫秒为单位的时间差
  return await window.notificationService.scheduleNotification(
    delay,
    title,
    content
  );
}

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
