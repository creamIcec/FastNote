# <div align="center"><img src="./favicon-512x512.png" alt="Fastnote logo" align="center" width="5%" height="5%" /> FastNote </div>

<div align="center">
    <a href="./README.md">English</a> | <a href="./README.zh-cn.md">简体中文</a>
    <p>便利贴般方便的快速笔记, 专注于<b>快</b>, <br/> 使用Electron, React 和 Vite 构建，采用Material Design 3设计</p>
</div>

<div align="center">

  <a href="">[![React][React.js]][React-url]</a>
  <a href="">[![Electron][Electron]][Electron-url]</a>
  <a href="">[![Vite][Vite]][Vite-url]</a>

</div>


## 💡 主要特性

- 随开随写: 自定义全局快捷键切换窗口(默认`meta`+`alt`+`x`)
- 快捷键覆盖: 节约鼠标操作时间
- 提醒设置: 随手记下，稍后再办
- 便利功能: 便捷导出，窗口置顶
- 深色/浅色模式切换
- 功能简洁，专注于<b>快</b>

## 💻 开发状态

- ✅ 目前支持`Windows`(`Linux`, `MacOS`开发中, 理论支持)
- ✅ 基本功能完成
- ✅ 多语言支持 (简体中文/英文)
- 🤔 更多功能开发中! 欢迎提 issue!

## 🛠️ 如何开发

### 1. 克隆仓库

使用`git clone`或下载代码等方式

### 2. 安装依赖

使用下面的指令安装依赖:

```bash
npm install
```

### 3. 从开发模式运行

使用下面的指令启动开发:

```bash
npm run dev
```

### 4. 构建发布

使用下面的指令发布:

**Windows**:

```bash
npm run dist:win
```

> [!NOTE]
>
> `package.json`中存在面向其他平台的发布指令，但还未测试过。如果需要构建面向其他平台(Linux/MacOS)的版本，可以运行`dist:linux`或`dist:mac`。如果在其他平台上运行时发现任何问题，欢迎随时提出 issue！

## ❤️ 欢迎贡献

如果在开发或使用过程中遇到任何问题，或有任何功能建议，欢迎随时提出 issue 和 Pull Request 哦!


[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Electron]: https://img.shields.io/badge/electron-20232A?style=for-the-badge&logo=electron&logocolor=47848F
[Electron-url]: https://www.electronjs.org/
[Vite]: https://img.shields.io/badge/vite-20232A?style=for-the-badge&logo=vite&logocolor=646CFF
[Vite-url]: https://vite.dev/
