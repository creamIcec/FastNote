import { useShallow } from "zustand/shallow";
import { useSidebarState } from "../../states/sidebar-state";
import styles from "./sidebar.module.css";
import {
  MdIconButton,
  MdIcon,
  MdList,
  MdListItem,
  MdOutlinedSegmentedButtonSet,
  MdOutlinedSegmentedButton,
} from "react-material-web";
import { useEffect, useState } from "react";
import { useTitle } from "../../states/content-state";
import { readNoteList } from "../../actions/api";

export default function SideBar() {
  const [isOpen, setIsOpen] = useSidebarState(
    useShallow((state) => [state.isOpen, state.setIsOpen])
  );
  const [noteList, setNoteList] = useState<string[]>([]);
  const [setTitle] = useTitle(useShallow((state) => [state.setTitle]));

  const handleClose = () => {
    setIsOpen(false);
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
                <MdListItem
                  type="link"
                  key={item}
                  onClick={() => handleSwitchNote(item)}
                >
                  {item}
                </MdListItem>
              ))}
            </MdList>
          </div>
        </div>
      </div>
    )
  );
}
