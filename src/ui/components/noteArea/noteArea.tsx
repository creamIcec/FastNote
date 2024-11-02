import { MdOutlinedTextField } from "react-material-web";
import styles from "./noteArea.module.css";

export default function NoteArea() {
  return (
    <main className={styles["textarea-container"]}>
      <MdOutlinedTextField
        type="textarea"
        className={styles.textarea}
      ></MdOutlinedTextField>
    </main>
  );
}
