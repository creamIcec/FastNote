import { MdIcon, MdIconButton } from "react-material-web";
import styles from "./appBar.module.css";
import { useSidebarState } from "../../states/sidebar-state";
import { useShallow } from "zustand/shallow";
import { hideWindow, maximizeWindow, minimizeWindow } from "../../actions/api";

export default function AppBar() {
  const [isOpen, setIsOpen] = useSidebarState(
    useShallow((state) => [state.isOpen, state.setIsOpen])
  );

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleMinimize = () => {
    minimizeWindow();
  };

  const handleMaximize = () => {
    maximizeWindow();
  };

  const handleHide = () => {
    hideWindow();
  };

  return (
    <header className={styles.header}>
      <div className={styles["operations-container"]}>
        <div className={styles["start-container"]}>
          <MdIconButton onClick={handleClick}>
            <MdIcon>menu</MdIcon>
          </MdIconButton>
          <MdIconButton>
            <MdIcon>save</MdIcon>
          </MdIconButton>
          <MdIconButton>
            <MdIcon>alarm</MdIcon>
          </MdIconButton>
        </div>
        <div className={styles["tail-container"]}>
          <MdIconButton
            className={styles["window-icon"]}
            onClick={handleMinimize}
          >
            <MdIcon>remove</MdIcon>
          </MdIconButton>
          <MdIconButton
            className={styles["window-icon"]}
            onClick={handleMaximize}
          >
            <MdIcon>crop_square</MdIcon>
          </MdIconButton>
          <MdIconButton className={styles["window-icon"]} onClick={handleHide}>
            <MdIcon>close</MdIcon>
          </MdIconButton>
        </div>
      </div>
      <div className={styles.title}>Title</div>
    </header>
  );
}
