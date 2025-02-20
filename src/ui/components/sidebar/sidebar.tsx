import { useShallow } from "zustand/shallow";
import { useSidebarState } from "../../states/sidebar-state";
import styles from "./sidebar.module.css";
import { MdIconButton, MdIcon, MdList, MdListItem } from "react-material-web";
import { useEffect, useState } from "react";
import {
  useAttemptDelete,
  useContent,
  useTitle,
} from "../../states/content-state";
import {
  deleteNote,
  readLastNoteNameInList,
  readNoteList,
} from "../../actions/api";

export default function SideBar({
  currentNoteTitle,
  setIsCopyrightPanelOpen,
}: {
  currentNoteTitle: string;
  setIsCopyrightPanelOpen: (isCopyrightPanelOpen: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useSidebarState(
    useShallow((state) => [state.isOpen, state.setIsOpen])
  );
  const [noteList, setNoteList] = useState<string[]>([]);
  const [deletedCount, setDeletedCount] = useState(0);
  const [setTitle] = useTitle(useShallow((state) => [state.setTitle]));
  const [content] = useContent(useShallow((state) => [state.content]));
  const [setAttemptDeleteName, setAttemptDeleteContent] = useAttemptDelete(
    useShallow((state) => [state.setName, state.setContent])
  );

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpenCopyrightPanel = () => {
    setIsOpen(false);
    setIsCopyrightPanelOpen(true);
  };

  useEffect(() => {
    console.log("刷新笔记列表");
    const fetchNoteList = async () => {
      const list = await readNoteList();
      setNoteList(list);
    };
    fetchNoteList();
  }, []);

  const handleSwitchNote = (name: string) => {
    setTitle(name);
    setIsOpen(false);
  };

  const handleDeleteNote = async (name: string) => {
    console.log("attempt to delete: " + name);
    //先不真正删除，而是将要删除的笔记id保存，撤销操作超时后才真正删除
    setAttemptDeleteName(name);
    setDeletedCount(deletedCount + 1);
    //TODO: 弹出撤销toast
    //1. 检查删除的是否是当前正在编辑的笔记, 如果不是, 进入第3步; 如果是, 显示撤销toast, 并开始计时, 进入第2步
    //2. 将正在编辑的笔记设为列表中除了删除笔记的最后一条笔记, 进入第4步
    //3. 如果刚刚删除的是最后一个笔记, 则创建一个临时内存对象用于保存数据, 创建一条新的笔记, 显示toast; 否则显示横幅, 进入第4步
    //4. 等待计时结束正式发送删除指令, 并移除删除状态。若中途删除了另一个笔记, 则回到第1步; 若用户中途点击了撤销, 分为下面两种情况: 1. 删除的不是最后一条笔记, 直接设置title为标记的title, 并移除删除状态; 2. 删除的是最后一条笔记, 从内存中恢复笔记。

    if (name !== currentNoteTitle) {
      if (deletedCount == noteList.length) {
        //删除的是最后一条笔记
        setAttemptDeleteContent(content);
        setTitle(undefined); //触发创建新的笔记
      } else {
        //TODO: 显示横幅
      }
    } else {
      //TODO: 显示toast
      //读取最后一条的名字
      const lastNoteInList = await readLastNoteNameInList();
      console.log("last name of notes in list: " + lastNoteInList);
      if (lastNoteInList && lastNoteInList !== true) {
        setTitle(lastNoteInList);
      }
    }

    //TODO: 等待计时, 暂时直接删除

    const result = await deleteNote(name);
    if (result) {
      console.log(`Note '${name}' has been deleted.`);
    } else {
      console.log(`Note '${name}' deleting failed.`);
    }

    setIsOpen(false);
  };

  return (
    isOpen && (
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <div className={styles["oprations-container"]}>
            <MdIconButton onClick={handleClose}>
              <MdIcon>close</MdIcon>
            </MdIconButton>
            <p>笔记列表</p>
          </div>
          <div className={styles["note-list-container"]}>
            <MdList className={styles["note-list"]}>
              {noteList.map((item) => (
                <NoteItem
                  itemId={item}
                  clickFunc={handleSwitchNote}
                  removeFunc={() => handleDeleteNote(item)}
                  key={item}
                ></NoteItem>
              ))}
            </MdList>
          </div>
          <div className={styles["bottom-container"]}>
            <MdIconButton onClick={handleOpenCopyrightPanel}>
              <MdIcon>info</MdIcon>
            </MdIconButton>
          </div>
        </div>
      </div>
    )
  );
}

function NoteItem({
  itemId,
  removeFunc,
  clickFunc,
}: {
  itemId: string;
  clickFunc?: (itemId: string) => void;
  removeFunc: (itemId: string) => void;
}) {
  const handleRemove = (e: React.MouseEvent) => {
    //TODO: any
    e.stopPropagation();
    removeFunc(itemId);
  };

  const [isHovering, setIsHovering] = useState(false);

  return (
    <>
      <MdListItem
        type="link"
        onClick={clickFunc ? () => clickFunc(itemId) : undefined}
        onMouseMove={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {itemId}
        {isHovering && (
          <MdIconButton slot="end" onClick={handleRemove}>
            <MdIcon>delete</MdIcon>
          </MdIconButton>
        )}
      </MdListItem>
    </>
  );
}
