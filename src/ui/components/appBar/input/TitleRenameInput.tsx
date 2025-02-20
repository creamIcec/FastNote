import {
  MdOutlinedTextField,
  MdOutlinedTextFieldElement,
} from "react-material-web";

import styles from "./TitleRenameInput.module.css";
import { useCallback, useEffect, useRef } from "react";

export default function TitleRenameInput({
  value,
  onKeyup,
  onBlur,
}: {
  value: string;
  onKeyup: (e: React.KeyboardEvent, newTitle: string) => void;
  onBlur: (e: React.FocusEvent | MouseEvent, newTitle: string) => void;
}) {
  const titleInputRef = useRef<MdOutlinedTextFieldElement>(null);

  const onBlurCallback = useCallback(
    (e: React.FocusEvent | MouseEvent) => {
      if (
        titleInputRef.current &&
        !titleInputRef.current.contains(e.target as Node)
      ) {
        onBlur(e, titleInputRef.current.value);
      }
    },
    [titleInputRef]
  );

  const onKeyUpCallback = useCallback(
    (e: React.KeyboardEvent) => {
      if (
        titleInputRef.current &&
        titleInputRef.current.contains(e.target as Node)
      ) {
        onKeyup(e, titleInputRef.current.value);
      }
    },
    [titleInputRef]
  );

  useEffect(() => {
    document.addEventListener("mousedown", onBlurCallback);
    return () => {
      document.removeEventListener("mousedown", onBlurCallback);
    };
  }, [onBlur]);

  useEffect(() => {
    //trick: postpone the action to next task loop, ensuring the render process of text field is finished, otherwise
    //we can't trigger any dom event on this element including `focus`.
    const timer = setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <MdOutlinedTextField
      value={value}
      onKeyUp={onKeyUpCallback}
      onBlur={onBlurCallback}
      className={styles["title-input"]}
      ref={titleInputRef}
    />
  );
}
