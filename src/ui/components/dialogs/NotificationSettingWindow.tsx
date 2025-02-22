import WindowBlockComponentWrapper from "./WindowBlockComponentWrapper";

import { useCallback, useEffect, useRef } from "react";
import {
  MdCheckbox,
  MdElevatedCard,
  MdFilledButton,
  MdOutlinedButton,
} from "react-material-web";

import styles from "./NotificationSettingWindow.module.css";
import DialogAnimationWrapper from "./animator/DialogAnimationWrapper";
import { useTranslation } from "react-i18next";

export default function NotificationSettingWindow({
  onSet,
  onCancel,
}: {
  onSet: (time: string, useContent: boolean) => void;
  onCancel: React.MouseEventHandler;
}) {
  const timePickerRef = useRef(null);
  const contentUseRef = useRef(null);

  const { t, i18n } = useTranslation();

  const handleOnQuit = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.key === "Escape") {
        onCancel(e as any); //TODO
      }
    },
    [onCancel]
  );

  const handleOnSet = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const timePickerInput = timePickerRef.current;
      const useContentInput = contentUseRef.current;
      if (timePickerInput && useContentInput) {
        const time = (timePickerInput as HTMLInputElement).value;
        const useContent = (useContentInput as HTMLInputElement).checked;
        onSet(time, useContent);
      }
    },
    [onSet]
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
          <div className={styles["block-container-title"]}>
            <h3 className={styles["theme-text"]}>{t("set_notification")}</h3>
            <p className={styles["theme-text"]}>
              {t("set_notification_support")}
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
              {t("use_note_as_notification")}
            </label>
          </div>
          <div className={styles["block-container-action-container"]}>
            <MdOutlinedButton
              className={styles["dialog-action-button-small"]}
              onClick={onCancel}
            >
              {t("Cancel")}
            </MdOutlinedButton>
            <MdFilledButton
              className={styles["dialog-action-button-small"]}
              onClick={handleOnSet}
            >
              {t("Ok")}
            </MdFilledButton>
          </div>
        </MdElevatedCard>
      </DialogAnimationWrapper>
    </WindowBlockComponentWrapper>
  );
}
