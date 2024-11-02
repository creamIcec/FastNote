import { useShallow } from "zustand/shallow";
import { useSidebarState } from "../../states/sidebar-state";
import styles from "./sidebar.module.css";
import { MdIconButton, MdIcon } from "react-material-web";

export default function SideBar() {
  const [isOpen, setIsOpen] = useSidebarState(
    useShallow((state) => [state.isOpen, state.setIsOpen])
  );

  const handleClose = () => {
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
          </div>
        </div>
      </div>
    )
  );
}
