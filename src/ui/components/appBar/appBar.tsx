import Mousetrap from "mousetrap";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  MdIcon,
  MdIconButton,
  MdOutlinedTextField,
  MdOutlinedTextFieldElement,
} from "react-material-web";
import { useShallow } from "zustand/shallow";
import {
  hideWindow,
  maximizeWindow,
  minimizeWindow,
  renameNote,
  saveNote,
  saveToExternalFile,
  scheduleNotification,
  setNewShortcut,
} from "../../actions/api";
import { useContent } from "../../states/content-state";
import { useSidebarState } from "../../states/sidebar-state";
import { useThemeState } from "../../states/theme-state";
import { changeTheme } from "../../utils/theme";
import NotificationSettingWindow from "../dialogs/NotificationSettingWindow";
import ShortcutBindWindow from "../dialogs/ShortcutBindWindow";
import styles from "./appBar.module.css";

export default function AppBar({
  title,
  setTitle,
}: {
  title: string;
  setTitle: (newTitle: string) => void;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useSidebarState(
    useShallow((state) => [state.isOpen, state.setIsOpen])
  );

  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const titleRef = useRef<MdOutlinedTextFieldElement>(null);
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
    try {
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
      }
    } catch (e) {
      toast.error(
        () => (
          <div className={styles.toast}>
            保存失败: {(e as Error).message}
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

  const rename = useCallback(async () => {
    const newTitle = titleRef.current?.value;
    if (!newTitle || newTitle === title) {
      setIsRenaming(false);
      return;
    }
    const result = await renameNote(title, newTitle);
    if (result) {
      setIsRenaming(false);
      setTitle(newTitle);
    }
  }, [title, setIsRenaming, setTitle]);

  const handleRenameByKey = useCallback(
    async (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        rename();
      }
    },
    [rename]
  );

  const handleRenameByClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        titleRef.current &&
        !titleRef.current.contains(event.target as Node)
      ) {
        titleRef.current.blur();
        rename();
      }
    },
    [rename]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleRenameByClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleRenameByClickOutside);
    };
  }, [handleRenameByClickOutside]);

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

  const handleScheduleNotification = async () => {
    if (!timePickerRef.current || !contentUseRef.current) {
      return;
    }
    const targetTime = (timePickerRef!.current as HTMLInputElement).value;
    console.log(targetTime);
    const useContentAsNotification = (
      contentUseRef!.current as HTMLInputElement
    ).checked;
    await scheduleNotification(
      targetTime,
      `来自笔记: ${title}`,
      useContentAsNotification ? content : "你有新的提醒"
    );
    setIsTimePickerOpen(false);
  };

  const stopKeyBinding = () => {
    setIsModifyKeyBinding(false);
  };

  const cancelScheduleNotification = () => {
    setIsTimePickerOpen(false);
  };

  const timePickerRef = useRef(null);
  const contentUseRef = useRef(null);

  return (
    <header className={styles.header}>
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
      <div className={styles.title} onClick={handleRenameAttempt}>
        {isRenaming ? (
          <MdOutlinedTextField
            value={title}
            onKeyUp={handleRenameByKey}
            onBlur={handleRenameByClickOutside}
            ref={titleRef}
            className={styles["title-input"]}
          />
        ) : (
          <p className={styles["theme-text"]}>{title}</p>
        )}
      </div>
    </header>
  );
}
