import WindowBlockComponentWrapper from "./WindowBlockComponentWrapper";

import {
  MdElevatedCard,
  MdIcon,
  MdIconButton,
  MdOutlinedButton,
} from "react-material-web";
import { useCallback, useEffect } from "react";

import styles from "./CopyrightAnnouncementWindow.module.css";

import favicon32 from "/icons/favicon-32x32.png";
import githubIcon from "/icons/github.svg";
import DialogAnimationWrapper from "./animator/DialogAnimationWrapper";

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
      <DialogAnimationWrapper>
        <MdElevatedCard className={styles.dialog}>
          <div className={styles.toolbar}>
            <MdIconButton onClick={() => setIsCopyrightWindowOpen(false)}>
              <MdIcon>close</MdIcon>
            </MdIconButton>
          </div>
          <div className={styles["block-container-title"]}>
            <div className={styles.logo}>
              <img src={favicon32} alt="fastnote logo" />
            </div>
            <div className={styles.description}>
              <p className={styles["theme-text"]}>
                <b>Fastnote</b>
              </p>
              <p>MIT License</p>
            </div>
          </div>
          <div className={styles["third-party-container"]}>
            <div className={styles["text-link-container"]}>
              <div>
                部分图标来自
                <span
                  onClick={() => {
                    window.externalResourceService.openInBrowser("svgrepo");
                  }}
                  style={{
                    textDecoration: "underline",
                    color: "#1199ee",
                    cursor: "pointer",
                  }}
                >
                  SVG Repo
                </span>
              </div>
              <div>
                设计启发来自
                <span
                  onClick={() => {
                    window.externalResourceService.openInBrowser("material3");
                  }}
                  style={{
                    textDecoration: "underline",
                    color: "#1199ee",
                    cursor: "pointer",
                  }}
                >
                  Material Design 3
                </span>
              </div>
            </div>
            <div className={styles["links"]}>
              <MdOutlinedButton style={{ padding: "4px" }}>
                <MdIcon slot="icon">code</MdIcon>
                第三方库
              </MdOutlinedButton>
              <MdOutlinedButton
                style={{ padding: "4px" }}
                onClick={() => {
                  window.externalResourceService.openInBrowser("github");
                }}
              >
                <img src={githubIcon} slot="icon" />
                Github
              </MdOutlinedButton>
            </div>
          </div>
        </MdElevatedCard>
      </DialogAnimationWrapper>
    </WindowBlockComponentWrapper>
  );
}
