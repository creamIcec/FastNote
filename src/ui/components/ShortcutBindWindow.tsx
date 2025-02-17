import { MdElevatedCard, MdOutlinedButton } from "react-material-web";
import WindowBlockComponentWrapper from "./WindowBlockComponentWrapper";
import styles from "./ShortcutBindWindow.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { isCharacterKey, isFunctionKeyDuplicated } from "../utils/keyboard";

export default function ShortcutBindWindow({
  applyShortcutCallback,
  stopKeyBinding,
}: {
  applyShortcutCallback: (shortcut?: string[]) => void;
  stopKeyBinding: () => void;
}) {
  const keyBindingInputRef = useRef(null);

  const [keys, setKeys] = useState<string[]>([]);

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
        console.warn("无法获取到按键绑定输入框");
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
    [keys]
  );

  const tryApplyShortcut = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      applyShortcutCallback(keys);
    },
    [keys]
  );

  useEffect(() => {
    document.addEventListener("keydown", appendKeyToSeries);
    document.addEventListener("keyup", tryApplyShortcut);
    console.log("打开全局侦听");
    return () => {
      document.removeEventListener("keydown", appendKeyToSeries);
      document.removeEventListener("keyup", tryApplyShortcut);
      console.log("关闭全局侦听");
    };
  }, [appendKeyToSeries]);

  return (
    <WindowBlockComponentWrapper>
      <MdElevatedCard className={styles.dialog}>
        <div className={styles["block-container-title"]}>
          <h3 className={styles["theme-text"]}>设置新的全局唤起快捷键</h3>
          <p className={styles["theme-text"]}>按下快捷键快速显示/隐藏应用</p>
        </div>
        <div className={styles["block-container-input-wrapper"]}>
          <input
            type="text"
            ref={keyBindingInputRef}
            className={styles["key-bind-input"]}
            disabled
            placeholder="按下按键组合..."
          />
          <MdOutlinedButton
            className={styles["dialog-action-button"]}
            onClick={(e) => applyShortcutCallback()}
          >
            还原原始快捷键
          </MdOutlinedButton>
        </div>
        <div className={styles["block-container-action-container"]}></div>
      </MdElevatedCard>
    </WindowBlockComponentWrapper>
  );
}
