import { MdOutlinedTextField } from "react-material-web";
import styles from "./noteArea.module.css";
import { useCallback, useEffect, useRef } from "react";
import lodash from "lodash";
import { useTypingState } from "../../states/note-saved-state";
import { useShallow } from "zustand/shallow";
import {
  readNote,
  registerOnWindowShowHandler,
  saveNote,
  unregisterAllOnWindowShowHandler,
} from "../../actions/api";
import {
  DEFAULT_NEW_NOTE_CONTENT,
  INDICATOR_REFRESH_INTERVAL,
  SAVE_NOTE_INTERVAL,
} from "../../constants";
import { useContent } from "../../states/content-state";
import { CallbackManager } from "../../utils/callback_manager";

export default function NoteArea({ title }: { title: string }) {
  const [content, setContent] = useContent(
    useShallow((state) => [state.content, state.setContent])
  );
  const timeoutIndicator = useRef<number>(0);
  const [setIsSaved] = useTypingState(
    useShallow((state) => [state.setIsSaved])
  );

  useEffect(() => {
    registerOnWindowShowHandler(() => {
      const textarea = textareaRef.current! as HTMLTextAreaElement;
      textarea.focus();
    }, CallbackManager.getInstance());

    return () => {
      unregisterAllOnWindowShowHandler();
    };
  }, []);

  const handleSaveThrottled = lodash.throttle(
    async (title: string, content: string) => {
      console.log(`正在保存笔记的内容:${content}`);
      console.log(`正在保存的笔记的标题:${title}`);
      const isSaved = await saveNote(title, content);
      setIsSaved(isSaved ? "saved" : "error");
      if (isSaved) {
        clearTimeout(timeoutIndicator.current);
        const intervalId = setTimeout(() => {
          setIsSaved("pending");
        }, SAVE_NOTE_INTERVAL);
        timeoutIndicator.current = intervalId;
      }
    },
    INDICATOR_REFRESH_INTERVAL
  );
  const handleInput = useCallback(
    (e: Event) => {
      const event = e as InputEvent;
      const newContent = (event.target as HTMLInputElement).value;
      setContent(newContent);
      handleSaveThrottled(title, newContent);
    },
    [title, setContent]
  );

  useEffect(() => {
    //应用加载(或内容改变)时获取笔记保存的内容
    const fetchNote = async () => {
      try {
        const savedContent = await readNote(title);
        console.log(`当前内容:${savedContent}`);
        //如果没有保存的内容, 说明第一次运行这个程序(或数据库不存在), 则创建一个新的
        if (savedContent === undefined) {
          console.log("第一次运行程序, 创建数据库");
          handleSaveThrottled(title, DEFAULT_NEW_NOTE_CONTENT);
          setContent(DEFAULT_NEW_NOTE_CONTENT);
          return;
        }
        setContent(savedContent);
      } catch (error) {
        console.error("Error fetching saved note:", error);
      }
    };
    fetchNote();

    //切换笔记后, 自动聚焦输入框
    const textarea = textareaRef.current! as HTMLTextAreaElement;
    textarea.focus();

    return () => {};
  }, [title, setContent]);

  const textareaRef = useRef(null);

  return (
    <main className={styles["textarea-container"]}>
      <MdOutlinedTextField
        ref={textareaRef}
        type="textarea"
        className={[styles.textarea, "mousetrap"].join(" ")}
        onInput={handleInput}
        value={content}
      ></MdOutlinedTextField>
    </main>
  );
}
