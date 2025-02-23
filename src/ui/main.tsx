import "@/index.css";
import App from "@/App.tsx";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LanguageManager } from "./utils/lang";

//初始化语言
LanguageManager.getInstance().initialize();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
