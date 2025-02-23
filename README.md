# <div align="center"><img src="./favicon-512x512.png" alt="Fastnote logo" align="center" width="5%" height="5%" /> FastNote </div>

<div align="center">
    <a href="./README.md">English</a> | <a href="./README.zh-cn.md">简体中文</a>
    <p>FastNote is an app focused on <b>convenience</b>, <br/> build with Electron, React, Vite, and our favorite material design 3.</p>
</div>

<div align="center">

  <a href="">[![React][React.js]][React-url]</a>
  <a href="">[![Electron][Electron]][Electron-url]</a>
  <a href="">[![Vite][Vite]][Vite-url]</a>

</div>

## 💡 Main Features

- Instant writing: Customize global shortcut keys to toggle the window (default: `meta`+`alt`+`x`)
- Keyboard shortcuts: Reduce mouse operation time
- Reminder settings: Jot down notes and handle them later
- Convenience features: Easy export, window always on top
- Dark/Light mode toggle
- Simple functionality, focused on <b>speed</b>

## 💻 Development Status

- ✅ Currently supports `Windows` (`Linux` and `MacOS` are under development and theoretically supported)
- ✅ Basic features completed
- ✅ Multi-language support (Simplified Chinese / English)
- 🤔 More Features! issues are welcome!

## 🛠️ How to Develop

### 1. Clone the Repository

Use `git clone` or download the code manually.

### 2. Install Dependencies

Run the following command to install dependencies:

```bash
npm install
```

### Run in Development Mode

Start the development server with:

```bash
npm run dev
```

### Build for Release

Use the following commands to build for release:

**Windows**:

```bash
npm run dist:win
```

> [!NOTE]
>
> The package.json file contains build scripts for other platforms, but they have not been tested yet. If you need to build for other platforms (Linux/MacOS), you can run dist:linux or dist:mac. If you encounter any issues when running on ?other platforms, feel free to open an issue!

## ❤️ Contributions Welcome

If you encounter any issues during development or usage, or if you have any feature suggestions, feel free to open an issue or submit a Pull Request!

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Electron]: https://img.shields.io/badge/electron-20232A?style=for-the-badge&logo=electron&logocolor=47848F
[Electron-url]: https://www.electronjs.org/
[Vite]: https://img.shields.io/badge/vite-20232A?style=for-the-badge&logo=vite&logocolor=646CFF
[Vite-url]: https://vite.dev/
