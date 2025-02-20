import { MdElevatedCard } from "react-material-web";
import WindowBlockComponentWrapper from "./WindowBlockComponentWrapper";
import styles from "./CopyrightAnnouncementWindow.module.css";
import { useCallback, useEffect } from "react";

export default function CopyrightAnnouncementWindow({
  setIsCopyrightWindowOpen,
}: {
  setIsCopyrightWindowOpen: (isOpen: boolean) => void;
}) {
  const handleOnQuit = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.key === "Escape") {
        setIsCopyrightWindowOpen(false);
      }
    },
    [setIsCopyrightWindowOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleOnQuit);
    return () => {
      document.removeEventListener("keydown", handleOnQuit);
    };
  }, []);
  return (
    <WindowBlockComponentWrapper>
      <MdElevatedCard className={styles.dialog}>
        <div className={styles["block-container-title"]}>
          <div className={styles.logo}>
            <img></img>
          </div>
          <p className={styles["theme-text"]}>
            到达这个时刻之后, 应用将会通知提醒你哦
          </p>
        </div>
      </MdElevatedCard>
    </WindowBlockComponentWrapper>
  );
}
