import { MdFab, MdIcon } from "react-material-web";
import styles from "./footer.module.css";
import { useShallow } from "zustand/shallow";
import { useTypingState } from "../../states/note-saved-state";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { useContent, useTitle } from "../../states/content-state";
import { getFormattedDateTime } from "../../utils/datetime";

export default function Footer() {
  const [isSaved] = useTypingState(useShallow((state) => [state.saveState]));
  const [content, setContent] = useContent(
    useShallow((state) => [state.content, state.setContent])
  );
  const [setTitle] = useTitle(useShallow((state) => [state.setTitle]));

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(
      function () {
        toast.success((t) => <div className={styles.toast}>复制成功!</div>, {
          duration: 2000,
          style: {
            borderRadius: "24px",
            background: "var(--md-sys-color-tertiary-container, #333)",
          },
        });
      },
      function () {
        toast.error(
          (t) => (
            <div className={styles.toast}>复制出错了, 可能是系统不支持</div>
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
    );
  }, [content]);

  const handleCreateNote = useCallback(async () => {
    const name = getFormattedDateTime();
    const result = await window.noteService.createNote(name);
    if (result === true) {
      setTitle(name);
      setContent("");
    }
  }, []);

  const getSaveStateIndicator = () => {
    switch (isSaved) {
      case "saved":
        return (
          <div className={styles["indicator"]}>
            <MdIcon>check_circle</MdIcon>
            <span className={styles["success-text"]}>保存成功</span>
          </div>
        );
      case "pending":
        return <></>;
      case "error":
        return (
          <div className={styles["indicator"]}>
            <MdIcon>error</MdIcon>
            <span className={styles["error-text"]}>保存失败，出错了</span>
          </div>
        );
    }
  };

  return (
    <footer className={styles.footer}>
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
