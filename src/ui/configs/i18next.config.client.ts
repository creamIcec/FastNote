import i18next from "i18next";
import { initReactI18next } from "react-i18next";

const config = {
  fallbackLng: "en",
  languages: ["en", "zh"],
};

const i18nextOptions = {
  interpolation: {
    escapeValue: false,
  },
  saveMissing: true,
  lng: "en",
  fallbackLng: config.fallbackLng,
  whitelist: config.languages,
  react: {
    wait: false,
  },
};

export function initI18nClient() {
  i18next.use(initReactI18next);
  if (!i18next.isInitialized) {
    i18next.init(i18nextOptions as any);
  }
  return i18next;
}
