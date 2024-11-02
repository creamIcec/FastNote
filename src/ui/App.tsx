import clsx from "clsx";
import styles from "./App.module.css";
import AppBar from "./components/appBar/appBar";
import Footer from "./components/footer/footer";
import NoteArea from "./components/noteArea/noteArea";
import SideBar from "./components/sidebar/sidebar";
import "./font.css";
import "./index.css";
import { useSidebarState } from "./states/sidebar-state";
import { useShallow } from "zustand/shallow";

function App() {
  const [isOpen] = useSidebarState(useShallow((state) => [state.isOpen]));

  return (
    <div
      className={clsx([styles.container, !isOpen && styles["sidebar-hidden"]])}
    >
      <AppBar />
      <NoteArea />
      <Footer />

      <SideBar />
    </div>
  );
}

export default App;
