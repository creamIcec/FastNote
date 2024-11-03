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
  saveToExternalFile,
} from "../../actions/api";
import { useTitle } from "../../states/content-state";
import { useSidebarState } from "../../states/sidebar-state";
import styles from "./appBar.module.css";
import { useThemeState } from "../../states/theme-state";
import { changeTheme } from "../../utils/theme";

export default function AppBar({ title }: { title: string }) {
  const [isOpen, setIsOpen] = useSidebarState(
    useShallow((state) => [state.isOpen, state.setIsOpen])
  );

  const [setTitle] = useTitle(useShallow((state) => [state.setTitle]));

  const titleRef = useRef<MdOutlinedTextFieldElement>(null);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);

  const [theme, setTheme, getNextTheme] = useThemeState(
    useShallow((state) => [state.theme, state.setTheme, state.getNextTheme])
  );

  const handleClick = () => {
    setIsOpen(!isOpen);
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

  return (
    <header className={styles.header}>
      <div className={styles["operations-container"]}>
        <div className={styles["start-container"]}>
          <MdIconButton onClick={handleClick}>
            <MdIcon>menu</MdIcon>
          </MdIconButton>
          <MdIconButton onClick={handleSaveExternal}>
            <MdIcon>save</MdIcon>
          </MdIconButton>
          <MdIconButton>
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
