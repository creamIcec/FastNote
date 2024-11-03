"use client";

import {
  argbFromHex,
  themeFromSourceColor,
  applyTheme,
} from "@material/material-color-utilities";

export type Theme = "light" | "system" | "dark";

export const DEFAULT_COLOR = "#63A002";

export function initTheme() {
  const theme = localStorage.getItem("theme");

  if (theme) {
    changeTheme(theme as Theme);
  } else {
    changeTheme("light");
  }
}

export function initColor() {
  const color = localStorage.getItem("sourceColor");
  if (color) {
    changeColor(color);
  } else {
    changeColor(DEFAULT_COLOR);
  }
}

/** @description 更改界面颜色。传入的参数应是颜色16进制表示法(例如: #ffffff, #123456) */
export function changeColor(newColor: string) {
  const theme = themeFromSourceColor(argbFromHex(newColor));
  const isDark = document.body.classList.contains("dark-mode");
  applyTheme(theme, { target: document.body, dark: isDark });

  localStorage.setItem("sourceColor", newColor);
}

/** @description 在根布局组件挂载的时候初始化主题 */
export function changeTheme(newTheme: Theme) {
  //如果没有指定具体的theme, 则用户倾向初始化
  // Get the theme from a hex color
  //好看的颜色: #F8A041
  //#B50061
  //#7B00F3

  const color = localStorage.getItem("sourceColor") || "#006954";
  const theme = themeFromSourceColor(argbFromHex(color), [
    {
      name: "highlight",
      value: argbFromHex("#ffd88d"),
      blend: false,
    },
  ]);

  let isDark;
  if (newTheme === "system") {
    // Check if the user has dark mode turned on
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  } else {
    isDark = newTheme === "dark";
  }

  // Apply the theme to the body by updating custom properties for material tokens
  applyTheme(theme, { target: document.body, dark: isDark });

  //设置dark-mode到body上，以便其他自定义变量产生作用
  document.body.classList.remove("dark-mode");
  if (isDark) {
    document.body.classList.add("dark-mode");
  }

  //修改存储的主题
  localStorage.setItem("theme", newTheme);
}
