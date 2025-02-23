import { changeLanguage, saveRecentNoteName } from "@/actions/api";
import AppBar from "@/components/appBar/appBar";
import Footer from "@/components/footer/footer";
import NoteArea from "@/components/noteArea/noteArea";
import SideBar from "@/components/sidebar/sidebar";
import "@/font.css";
import "@/index.css";
import { useTitle } from "@/states/content-state";
import { useSidebarState } from "@/states/sidebar-state";
import { initColor, initTheme } from "@/utils/theme";

import "@/lib/mousetrap_pause.js";
import CopyrightAnnouncementWindow from "@/components/dialogs/CopyrightAnnouncementWindow.js";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useShallow } from "zustand/shallow";

import styles from "./App.module.css";
import LanguageSettingWindow from "./components/dialogs/LanguageSettingWindow";
import i18next from "i18next";
import { LanguageManager } from "./utils/lang";

function App() {
  const [isOpen] = useSidebarState(useShallow((state) => [state.isOpen]));
  const [title, setTitle, fetchAndSetPrevTitle] = useTitle(
    useShallow((state) => [
      state.title,
      state.setTitle,
      state.fetchAndSetPrevTitle,
    ])
  );
  const [isAppBarDisplay, setIsAppBarDisplay] = useState(true);
  const [isFooterDisplay, setIsFooterDisplay] = useState(true);
  const [isCopyrightWindowOpen, setIsCopyrightWindowOpen] = useState(false);
  const [isLanguageSettingPanelOpen, setIsLanguageSettingPanelOpen] =
    useState(false);

  useEffect(() => {
    //应用加载时获取之前笔记的标题
    fetchAndSetPrevTitle();
  }, [fetchAndSetPrevTitle]);

  useEffect(() => {
    initTheme();
    initColor();
  }, []);

  useEffect(() => {
    console.log(`New title has been set:${title}`);
    if (title) {
      const saveRecentTitle = async () => {
        await saveRecentNoteName(title);
      };
      saveRecentTitle();
    }
  }, [title]);

  useEffect(() => {
    if (isAppBarDisplay || isFooterDisplay) {
      setIsAppBarDisplay(true);
      setIsFooterDisplay(true);
    }
  }, [isAppBarDisplay, isFooterDisplay]);

  const handleLanguageChange = async (lang: string) => {
    const bundle = await changeLanguage(lang);
    const namespace =
      LanguageManager.getInstance().getNamespace() || "translation";
    if (!i18next.hasResourceBundle(lang, namespace)) {
      i18next.addResourceBundle(lang, namespace, bundle);
    }
    i18next.changeLanguage(lang);
  };

  return (
    <div
      className={clsx([
        styles.container,
        !isOpen && styles["sidebar-hidden"],
        !isAppBarDisplay && styles["appbar-hidden"],
      ])}
    >
      {title && (
        <AppBar
          title={title}
          setTitle={setTitle}
          isDisplay={isAppBarDisplay}
          setIsDisplay={setIsAppBarDisplay}
        />
      )}
      {title && <NoteArea title={title} />}
      {isCopyrightWindowOpen && (
        <CopyrightAnnouncementWindow
          setIsCopyrightWindowOpen={setIsCopyrightWindowOpen}
        ></CopyrightAnnouncementWindow>
      )}
      {isLanguageSettingPanelOpen && (
        <LanguageSettingWindow
          setIsLanguageSettingWindowOpen={setIsLanguageSettingPanelOpen}
          applyLanguageSetting={handleLanguageChange}
        ></LanguageSettingWindow>
      )}
      <Footer isDisplay={isFooterDisplay} setIsDisplay={setIsFooterDisplay} />

      {isOpen && title && (
        <SideBar
          setIsCopyrightPanelOpen={setIsCopyrightWindowOpen}
          setIsLanguageSettingPanelOpen={setIsLanguageSettingPanelOpen}
          currentNoteTitle={title}
        />
      )}
      <Toaster position="bottom-center"></Toaster>
    </div>
  );
}

export default App;
