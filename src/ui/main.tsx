import "@/index.css";
import App from "@/App.tsx";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { getDefaultTranslations } from "./actions/api";
import { initI18nClient } from "./configs/i18next.config.client";

//初始化i18n客户端
const i18n = initI18nClient();
const initialTranslations = await getDefaultTranslations();
i18n.addResourceBundle("en", "translation", initialTranslations);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
