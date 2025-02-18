import clsx from "clsx";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useShallow } from "zustand/shallow";
import { saveRecentNoteName } from "./actions/api";
import styles from "./App.module.css";
import AppBar from "./components/appBar/appBar";
import Footer from "./components/footer/footer";
import NoteArea from "./components/noteArea/noteArea";
import SideBar from "./components/sidebar/sidebar";
import "./font.css";
import "./index.css";
import { useTitle } from "./states/content-state";
import { useSidebarState } from "./states/sidebar-state";
import { initColor, initTheme } from "./utils/theme";

import "./lib/mousetrap_pause.js";

function App() {
  const [isOpen] = useSidebarState(useShallow((state) => [state.isOpen]));
  const [title, setTitle, fetchAndSetPrevTitle] = useTitle(
    useShallow((state) => [
      state.title,
      state.setTitle,
      state.fetchAndSetPrevTitle,
    ])
  );

  useEffect(() => {
    //应用加载时获取之前笔记的标题
    fetchAndSetPrevTitle();
  }, []);

  useEffect(() => {
    initTheme();
    initColor();
  }, []);

  useEffect(() => {
    console.log(`标题发生改变:${title}`);
    if (title) {
      const saveRecentTitle = async () => {
        const _ = await saveRecentNoteName(title);
      };
      saveRecentTitle();
    }
  }, [title]);

  return (
    <div
      className={clsx([styles.container, !isOpen && styles["sidebar-hidden"]])}
    >
      {title && <AppBar title={title} setTitle={setTitle} />}
      {title && <NoteArea title={title} />}
      <Footer />

      {isOpen && title && <SideBar currentNoteTitle={title} />}
      <Toaster position="bottom-center"></Toaster>
    </div>
  );
}

export default App;
