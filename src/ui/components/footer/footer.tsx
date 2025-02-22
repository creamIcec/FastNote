import {
  copyCurrentNoteContent,
  createNote,
  registerOnWindowShowHandler,
  unregisterAllOnWindowShowHandler,
} from "@/actions/api";
import { useContent, useTitle } from "@/states/content-state";
import { useTypingState } from "@/states/note-saved-state";
import { CallbackManager } from "@/utils/callback_manager";
import {
  getCurrentHour,
  getCurrentMinute,
  getCurrentSecond,
  getFormattedDateTime,
} from "@/utils/datetime";

import clsx from "clsx";
import Mousetrap from "mousetrap";
import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { MdFab, MdIcon } from "react-material-web";
import { useShallow } from "zustand/shallow";

import styles from "./footer.module.css";
import { useTranslation } from "react-i18next";

export default function Footer({
  isDisplay,
  setIsDisplay,
}: {
  isDisplay: boolean;
  setIsDisplay: (isDisplay: boolean) => void;
}) {
  const [isSaved] = useTypingState(useShallow((state) => [state.saveState]));
  const [content, setContent] = useContent(
    useShallow((state) => [state.content, state.setContent])
  );
  const [setTitle] = useTitle(useShallow((state) => [state.setTitle]));

  const { t, i18n } = useTranslation();

  const handleCopy = useCallback(() => {
    copyCurrentNoteContent(content).then(
      function () {
        toast.success(
          () => <div className={styles.toast}>{t("copy_succeed")}</div>,
          {
            duration: 2000,
            style: {
              borderRadius: "24px",
              background: "var(--md-sys-color-tertiary-container, #333)",
              color: "var(--text-color)",
            },
          }
        );
      },
      function () {
        toast.error(
          () => <div className={styles.toast}>{t("copy_failed")}</div>,
          {
            duration: 2000,
            style: {
              borderRadius: "24px",
              background: "var(--md-sys-color-error-container, #333)",
              color: "var(--text-color)",
            },
          }
        );
      }
    );
  }, [content]);

  const handleCreateNote = useCallback(async () => {
    const name = getFormattedDateTime();
    const result = await createNote(name);
    if (result === true) {
      setTitle(name);
      setContent("");
    }
  }, [setContent, setTitle]);

  const getSaveStateIndicator = () => {
    switch (isSaved) {
      case "saved":
        return (
          <div className={styles["indicator"]}>
            <MdIcon className={styles["success-text"]}>check_circle</MdIcon>
            <span className={styles["success-text"]}>{`${t(
              "last_save_time_indicator"
            )} ${getCurrentHour()}:${getCurrentMinute()}:${getCurrentSecond()}`}</span>
          </div>
        );
      case "pending":
        return <></>;
      case "error":
        return (
          <div className={styles["indicator"]}>
            <MdIcon className={styles["error-text"]}>error</MdIcon>
            <span className={styles["error-text"]}>{t("save_failed")}</span>
          </div>
        );
    }
  };

  useEffect(() => {
    Mousetrap.bind(["ctrl+n", "command+n"], () => {
      console.log("Shortcut triggered: create new note");
      handleCreateNote();
    });

    Mousetrap.bind(["ctrl+alt+c", "command+option+c"], () => {
      console.log("Shortcut triggered: copy content");
      handleCopy();
    });

    return () => {
      Mousetrap.unbind(["ctrl+n", "command+n"]);
      Mousetrap.unbind(["ctrl+alt+c", "command+option+c"]);
    };
  }, [handleCopy, handleCreateNote]);

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
      if (window.innerHeight - e.clientY < 20) {
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
    <footer
      className={clsx(isDisplay ? styles.footer : styles["footer-collapse"])}
    >
      <div className={styles["head-container"]}>{getSaveStateIndicator()}</div>
      <div className={styles["tail-container"]}>
        <MdFab onClick={handleCopy} variant="secondary">
          <MdIcon slot="icon">content_copy</MdIcon>
        </MdFab>
        <MdFab onClick={handleCreateNote} variant="primary">
          <MdIcon slot="icon">add</MdIcon>
        </MdFab>
      </div>
    </footer>
  );
}
