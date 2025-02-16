import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  MdCheckbox,
  MdElevatedCard,
  MdFilledButton,
  MdIcon,
  MdIconButton,
  MdOutlinedButton,
  MdOutlinedTextField,
  MdOutlinedTextFieldElement,
} from "react-material-web";
import { useShallow } from "zustand/shallow";
import {
  hideWindow,
  maximizeWindow,
  minimizeWindow,
  renameNote,
  saveToExternalFile,
  scheduleNotification,
} from "../../actions/api";
import { useContent, useTitle } from "../../states/content-state";
import { useSidebarState } from "../../states/sidebar-state";
import { useThemeState } from "../../states/theme-state";
import { getCurrentHour, getCurrentMinute } from "../../utils/datetime";
import { changeTheme } from "../../utils/theme";
import styles from "./appBar.module.css";

export default function AppBar({ title }: { title: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useSidebarState(
    useShallow((state) => [state.isOpen, state.setIsOpen])
  );

  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);

  const [setTitle] = useTitle(useShallow((state) => [state.setTitle]));

  const titleRef = useRef<MdOutlinedTextFieldElement>(null);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);

  const [theme, setTheme, getNextTheme] = useThemeState(
    useShallow((state) => [state.theme, state.setTheme, state.getNextTheme])
  );

  const [content] = useContent(useShallow((state) => [state.content]));

  const [value, onTimeChange] = useState(
    `${getCurrentHour()}:${getCurrentMinute()}`
  );

  const handleClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMinimize = () => {
    minimizeWindow();
  };

  const handleMaximize = () => {
    maximizeWindow();
  };

  const handleHide = () => {
    hideWindow();
  };

  const handleSaveExternal = useCallback(async () => {
    let result: string | undefined;
    try {
      result = await saveToExternalFile(title);
      if (result) {
        toast.success(
          (t) => (
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
        (t) => (
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
  }, []);

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
  }, [title]);

  const handleRenameByKey = useCallback(
    async (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        rename();
      }
    },
    [title]
  );

  const handleRenameByClickOutside = useCallback(
    (event: any) => {
      if (titleRef.current && !titleRef.current.contains(event.target)) {
        titleRef.current.blur();
        rename();
      }
    },
    [title]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleRenameByClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleRenameByClickOutside);
    };
  }, []);

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

  const cancelScheduleNotification = () => {
    setIsTimePickerOpen(false);
  };

  const timePickerRef = useRef(null);
  const contentUseRef = useRef(null);

  return (
    <header className={styles.header}>
      {isTimePickerOpen && (
        <div className={styles["time-picker-container"]}>
          <MdElevatedCard className={styles.dialog}>
            <div className={styles["time-picker-title"]}>
              <h3>设置一个提醒时刻</h3>
              <p>到达这个时刻之后, 应用将会通知提醒你哦</p>
            </div>
            <div className={styles["time-picker-input-wrapper"]}>
              <input
                aria-label="Time"
                type="time"
                className={styles["time-picker"]}
                ref={timePickerRef}
              />
              <label>
                <MdCheckbox
                  touch-target="wrapper"
                  checked
                  ref={contentUseRef}
                ></MdCheckbox>
                以笔记内容作为提醒内容
              </label>
            </div>
            <div className={styles["time-picker-action-container"]}>
              <MdOutlinedButton
                className={styles["time-picker-action-button"]}
                onClick={cancelScheduleNotification}
              >
                取消
              </MdOutlinedButton>
              <MdFilledButton
                className={styles["time-picker-action-button"]}
                onClick={handleScheduleNotification}
              >
                确定
              </MdFilledButton>
            </div>
          </MdElevatedCard>
        </div>
      )}
      <div className={styles["operations-container"]}>
        <div className={styles["start-container"]}>
          <MdIconButton onClick={handleClick}>
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
          <p className={styles["title-text"]}>{title}</p>
        )}
      </div>
    </header>
  );
}
