import { MdFab, MdIcon } from "react-material-web";
import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles["tail-container"]}>
        <MdFab>
          <MdIcon slot="icon">content_copy</MdIcon>
        </MdFab>
        <MdFab>
          <MdIcon slot="icon">add</MdIcon>
        </MdFab>
      </div>
    </footer>
  );
}
