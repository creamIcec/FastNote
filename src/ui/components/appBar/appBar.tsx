import {
  hideWindow,
  maximizeWindow,
  minimizeWindow,
  registerOnWindowShowHandler,
  renameNote,
  saveNote,
  saveToExternalFile,
  scheduleNotification,
  setNewShortcut,
  unregisterAllOnWindowShowHandler,
} from "@/actions/api";
import NotificationSettingWindow from "@/components/dialogs/NotificationSettingWindow";
import ShortcutBindWindow from "@/components/dialogs/ShortcutBindWindow";
import { useContent } from "@/states/content-state";
import { useSidebarState } from "@/states/sidebar-state";
import { useThemeState } from "@/states/theme-state";
import { CallbackManager } from "@/utils/callback_manager";
import { changeTheme } from "@/utils/theme";

import clsx from "clsx";
import Mousetrap from "mousetrap";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { MdIcon, MdIconButton } from "react-material-web";
import { useShallow } from "zustand/shallow";

import styles from "./appBar.module.css";
import TitleRenameInput from "./input/TitleRenameInput";
import { AnimatePresence } from "framer-motion";

export default function AppBar({
  title,
  setTitle,
  isDisplay,
  setIsDisplay,
}: {
  title: string;
  setTitle: (newTitle: string) => void;
  isDisplay: boolean;
  setIsDisplay: (isDisplay: boolean) => void;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useSidebarState(
    useShallow((state) => [state.isOpen, state.setIsOpen])
  );

  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const [isRenaming, setIsRenaming] = useState<boolean>(false);

  const [theme, setTheme, getNextTheme] = useThemeState(
    useShallow((state) => [state.theme, state.setTheme, state.getNextTheme])
  );

  const [content] = useContent(useShallow((state) => [state.content]));
  const [isModifyKeyBinding, setIsModifyKeyBinding] = useState(false);

  const handleOpenSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMinimize = () => {
    minimizeWindow();
  };

  const handleMaximize = () => {
    maximizeWindow();
  };

  const handleBindKey = () => {
    console.log("用户打开修改按键界面");
    setIsModifyKeyBinding(!isModifyKeyBinding);
  };

  //如果传入的shortcut为空, 则恢复原始快捷键; 否则设置shortcut为快捷键
  const applyShortcut = (shortcut?: string[]) => {
    const result = setNewShortcut(shortcut);
    if (result) {
      console.log("设置新快捷键成功");
      toast.success(
        () => (
          <div className={styles.toast}>
            {shortcut ? (
              <>
                成功设置快捷键:
                <br />
                {shortcut.join("+")}
              </>
            ) : (
              "恢复原始快捷键"
            )}
          </div>
        ),
        {
          duration: 2000,
          style: {
            borderRadius: "24px",
            background: "var(--md-sys-color-tertiary-container, #333)",
          },
        }
      );
    } else {
      console.warn("设置新快捷键失败");
      toast.error(() => <div className={styles.toast}>设置新快捷键失败</div>, {
        duration: 2000,
        style: {
          borderRadius: "24px",
          background: "var(--md-sys-color-error-container, #333)",
          color: "var(--text-color)",
        },
      });
    }
    setIsModifyKeyBinding(false);
  };

  const handleHide = () => {
    hideWindow();
  };

  const handleSaveExternal = useCallback(async () => {
    let result: string | undefined;
    //assume content in database is up to date with that in textarea
    await saveNote(title, content);
    result = await saveToExternalFile(title);
    if (result) {
      toast.success(
        () => (
          <div className={styles.toast}>
            成功保存到:
            <br />
            {result}
          </div>
        ),
        {
          duration: 2000,
          style: {
            borderRadius: "24px",
            background: "var(--md-sys-color-tertiary-container, #333)",
          },
        }
      );
    } else {
      toast.error(
        () => (
          <div className={styles.toast}>
            保存失败, 可能是取消了
            <br /> {result}
          </div>
        ),
        {
          duration: 2000,
          style: {
            borderRadius: "24px",
            background: "var(--md-sys-color-error-container, #333)",
          },
        }
      );
    }
  }, [title, content]);

  const handleRenameAttempt = useCallback(() => {
    setIsRenaming(true);
  }, []);

  const rename = useCallback(
    async (newTitle: string) => {
      if (!newTitle || newTitle === title) {
        setIsRenaming(false);
        return;
      }
      const result = await renameNote(title, newTitle);
      if (result) {
        setIsRenaming(false);
        setTitle(newTitle);
      }
    },
    [title, setIsRenaming, setTitle]
  );

  const handleRenameByKey = useCallback(
    async (e: React.KeyboardEvent, newTitle: string) => {
      if (e.key === "Enter") {
        rename(newTitle);
      }
    },
    [rename]
  );

  const handleRenameByClickOutside = useCallback(
    (event: MouseEvent | React.FocusEvent, newTitle: string) => {
      rename(newTitle);
    },
    [rename]
  );

  useEffect(() => {
    Mousetrap.bind(["ctrl+s", "command+s"], () => {
      console.log("快捷键触发保存");
      handleSaveExternal();
      return false;
    });

    return () => {
      Mousetrap.unbind(["ctrl+s", "command+s"]);
    };
  }, [handleSaveExternal]);

  const getThemeIcon = () => {
    switch (theme) {
      case "system":
        return "computer";
      case "dark":
        return "dark_mode";
      case "light":
        return "light_mode";
    }
  };

  const handleThemeChange = () => {
    const newTheme = getNextTheme();
    setTheme(newTheme);
    changeTheme(newTheme);
  };

  const handleToggleTimePicker = () => {
    setIsTimePickerOpen(!isTimePickerOpen);
  };

  const handleScheduleNotification = async (
    targetTime: string,
    useContent: boolean
  ) => {
    console.log(targetTime);
    await scheduleNotification(
      targetTime,
      `来自笔记: ${title}`,
      useContent ? content : "你有新的提醒"
    );
    setIsTimePickerOpen(false);
  };

  const stopKeyBinding = () => {
    setIsModifyKeyBinding(false);
  };

  const cancelScheduleNotification = () => {
    setIsTimePickerOpen(false);
  };

  useEffect(() => {
    registerOnWindowShowHandler(() => {
      setIsDisplay(false);
    }, CallbackManager.getInstance());

    return () => {
      unregisterAllOnWindowShowHandler();
    };
  }, []);

  useEffect(() => {
    const onTryAccessAppBar = (e: MouseEvent) => {
      if (e.clientY < 20) {
        setIsDisplay(true);
      }
    };

    if (!isDisplay) {
      document.addEventListener("mousemove", onTryAccessAppBar);
    }

    return () => {
      document.removeEventListener("mousemove", onTryAccessAppBar);
    };
  }, [isDisplay]);

  return (
    <header
      className={clsx(isDisplay ? styles.header : styles["header-collapse"])}
    >
      {isTimePickerOpen && (
        <NotificationSettingWindow
          onSet={handleScheduleNotification}
          onCancel={cancelScheduleNotification}
        ></NotificationSettingWindow>
      )}
      {isModifyKeyBinding && (
        <ShortcutBindWindow
          applyShortcutCallback={applyShortcut}
          stopKeyBinding={stopKeyBinding}
        ></ShortcutBindWindow>
      )}
      <div className={styles["operations-container"]}>
        <div className={styles["start-container"]}>
          <MdIconButton onClick={handleOpenSidebar}>
            <MdIcon>menu</MdIcon>
          </MdIconButton>
          <MdIconButton onClick={handleSaveExternal}>
            <MdIcon>save</MdIcon>
          </MdIconButton>
          <MdIconButton onClick={handleToggleTimePicker}>
            <MdIcon>alarm</MdIcon>
          </MdIconButton>
          <MdIconButton onClick={handleThemeChange}>
            <MdIcon>{getThemeIcon()}</MdIcon>
          </MdIconButton>
        </div>
        <div className={styles["tail-container"]}>
          <MdIconButton
            className={styles["window-icon"]}
            onClick={handleBindKey}
          >
            <MdIcon>keyboard_keys</MdIcon>
          </MdIconButton>
          <MdIconButton
            className={styles["window-icon"]}
            onClick={handleMinimize}
          >
            <MdIcon>remove</MdIcon>
          </MdIconButton>
          <MdIconButton
            className={styles["window-icon"]}
            onClick={handleMaximize}
          >
            <MdIcon>crop_square</MdIcon>
          </MdIconButton>
          <MdIconButton className={styles["window-icon"]} onClick={handleHide}>
            <MdIcon>close</MdIcon>
          </MdIconButton>
        </div>
      </div>
      <div
        className={styles.title}
        onClick={handleRenameAttempt}
        style={!isRenaming ? { marginLeft: "8px" } : undefined}
      >
        {isRenaming ? (
          <TitleRenameInput
            value={title}
            onKeyup={handleRenameByKey}
            onBlur={handleRenameByClickOutside}
          ></TitleRenameInput>
        ) : (
          <p className={styles["theme-text"]}>{title}</p>
        )}
      </div>
    </header>
  );
}
