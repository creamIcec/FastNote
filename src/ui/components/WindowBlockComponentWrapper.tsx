import { ReactNode } from "react";
import styles from "./WindowBlockComponentWrapper.module.css";

export default function WindowBlockComponentWrapper({
  children,
}: {
  children?: ReactNode;
}) {
  return <div className={styles.container}>{children}</div>;
}
