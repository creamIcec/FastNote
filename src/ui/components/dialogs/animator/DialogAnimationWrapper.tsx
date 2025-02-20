import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";

export default function DialogAnimationWrapper({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <motion.div initial={{ y: "4vh" }} animate={{ y: 0 }} key="child">
      {children}
    </motion.div>
  );
}
