import "@/index.css";
import App from "@/App.tsx";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LanguageManager } from "./utils/lang";

async function initialize() {
  //初始化语言
  await LanguageManager.getInstance().initialize();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

initialize().catch((error) => {
  console.log(`Failed to initialize application: ${error}`);
});
