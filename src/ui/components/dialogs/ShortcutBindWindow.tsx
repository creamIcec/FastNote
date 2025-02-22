import WindowBlockComponentWrapper from "./WindowBlockComponentWrapper";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  isCharacterKey,
  isFunctionKeyDuplicated,
  shortcutMap,
} from "@/utils/keyboard";
import ShortcutDisplayContainer from "@/components/helper/ShortcutDisplayContainer";

import Mousetrap from "mousetrap";
import {
  MdElevatedCard,
  MdFilledCard,
  MdOutlinedButton,
} from "react-material-web";

import styles from "./ShortcutBindWindow.module.css";
import DialogAnimationWrapper from "./animator/DialogAnimationWrapper";
import { useTranslation } from "react-i18next";

export default function ShortcutBindWindow({
  applyShortcutCallback,
  stopKeyBinding,
}: {
  applyShortcutCallback: (shortcut?: string[]) => void;
  stopKeyBinding: () => void;
}) {
  const keyBindingInputRef = useRef(null);
  const [keys, setKeys] = useState<string[]>([]);

  const { t, i18n } = useTranslation();

  const appendKeyToSeries = useCallback(
    (e: KeyboardEvent) => {
      //1. 用户按下一个键
      //2. 判断是否符合规则, 符合则添加到序列中
      //3. 当用户按下不带任何修饰键的Enter后, 注册刚刚按下的新按键序列; 当用户按下Esc或鼠标点击输入区域以外的地方后, 退出修改流程
      //4. 结束
      e.preventDefault();
      if (e.repeat) {
        return;
      }
      const key = e.code === "Space" ? "Space" : e.key;
      if (key === "Escape") {
        stopKeyBinding();
        return;
      }
      const input = keyBindingInputRef.current as unknown as HTMLInputElement;
      if (!input) {
        console.warn("Unable to access input for key binding");
        return;
      }

      const lastKey = keys.at(-1);
      let rebind = false;

      if (isCharacterKey(lastKey) || lastKey === "Space") {
        input.value = "";
        rebind = true;
      }

      if (isFunctionKeyDuplicated([...keys, key])) {
        input.value = "";
        rebind = true;
      }

      if (input.value !== "") {
        input.value += "+";
      }

      input.value += key;
      if (rebind) {
        setKeys([key]);
      } else {
        setKeys([...keys, key]);
      }
    },
    [keys, stopKeyBinding]
  );

  const tryApplyShortcut = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      applyShortcutCallback(keys);
    },
    [keys, applyShortcutCallback]
  );

  useEffect(() => {
    document.addEventListener("keydown", appendKeyToSeries);
    document.addEventListener("keyup", tryApplyShortcut);
    console.log("Global keydown listener enabled");
    return () => {
      document.removeEventListener("keydown", appendKeyToSeries);
      document.removeEventListener("keyup", tryApplyShortcut);
      console.log("Global keydown listener disabled");
    };
  }, [appendKeyToSeries, tryApplyShortcut]);

  useEffect(() => {
    (Mousetrap as any).pause(); //TODO: type definition
    return () => (Mousetrap as any).unpause();
  }, []);

  return (
    <WindowBlockComponentWrapper>
      <DialogAnimationWrapper>
        <MdElevatedCard className={styles.dialog}>
          <div className={styles["block-container-title"]}>
            <h3 className={styles["theme-text"]}>{t("set_global_shortcut")}</h3>
            <p className={styles["theme-text"]}>
              {t("set_global_shortcut_support")}
            </p>
          </div>
          <div className={styles["block-container-input-wrapper"]}>
            <input
              type="text"
              ref={keyBindingInputRef}
              className={styles["key-bind-input"]}
              disabled
              placeholder={t("key_binding_placeholder")}
            />
            <MdOutlinedButton
              className={styles["dialog-action-button"]}
              onClick={() => applyShortcutCallback()}
            >
              {t("restore_default_shortcut")}
            </MdOutlinedButton>
          </div>
          <div className={styles["block-container-action-container"]}></div>
        </MdElevatedCard>

        <MdFilledCard className={styles["shortcuts-keys-list"]}>
          <div className={styles["shortcut-container"]}>
            {t("create_new_note")}
            <div className={styles["shortcut"]}>
              {shortcutMap.createNote.map((item) => (
                <ShortcutDisplayContainer
                  shortcut={item}
                  key={item}
                ></ShortcutDisplayContainer>
              ))}
            </div>
          </div>
          <div className={styles["shortcut-container"]}>
            {t("copy_content")}
            <div className={styles["shortcut"]}>
              {shortcutMap.instantCopy.map((item) => (
                <ShortcutDisplayContainer
                  shortcut={item}
                  key={item}
                ></ShortcutDisplayContainer>
              ))}
            </div>
          </div>
          <div className={styles["shortcut-container"]}>
            {t("save_external")}
            <div className={styles["shortcut"]}>
              {shortcutMap.saveExternal.map((item) => (
                <ShortcutDisplayContainer
                  shortcut={item}
                  key={item}
                ></ShortcutDisplayContainer>
              ))}
            </div>
          </div>
        </MdFilledCard>
      </DialogAnimationWrapper>
    </WindowBlockComponentWrapper>
  );
}
