import WindowBlockComponentWrapper from "./WindowBlockComponentWrapper";

import { useCallback, useEffect, useRef } from "react";
import {
  MdCheckbox,
  MdElevatedCard,
  MdFilledButton,
  MdOutlinedButton,
} from "react-material-web";

import styles from "./NotificationSettingWindow.module.css";

export default function NotificationSettingWindow({
  onSet,
  onCancel,
}: {
  onSet: React.MouseEventHandler;
  onCancel: React.MouseEventHandler;
}) {
  const timePickerRef = useRef(null);
  const contentUseRef = useRef(null);

  const handleOnQuit = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.key === "Escape") {
        onCancel(e as any); //TODO
      }
    },
    [onCancel]
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
          <h3 className={styles["theme-text"]}>设置一个提醒时刻</h3>
          <p className={styles["theme-text"]}>
            到达这个时刻之后, 应用将会通知提醒你哦
          </p>
        </div>
        <div className={styles["block-container-input-wrapper"]}>
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
        <div className={styles["block-container-action-container"]}>
          <MdOutlinedButton
            className={styles["dialog-action-button-small"]}
            onClick={onCancel}
          >
            取消
          </MdOutlinedButton>
          <MdFilledButton
            className={styles["dialog-action-button-small"]}
            onClick={onSet}
          >
            确定
          </MdFilledButton>
        </div>
      </MdElevatedCard>
    </WindowBlockComponentWrapper>
  );
}
