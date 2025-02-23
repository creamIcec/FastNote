import i18next from "i18next";
import { initReactI18next } from "react-i18next";
export function prepareI18nClient(languageInfo: any) {
  const config = {
    fallbackLng: languageInfo.fallbackLang,
    languages: languageInfo.languages,
  };

  const i18nextOptions = {
    interpolation: {
      escapeValue: false,
    },
    saveMissing: true,
    lng: languageInfo.currentLang,
    fallbackLng: config.fallbackLng,
    whitelist: config.languages,
    react: {
      wait: false,
    },
  };

  i18next.use(initReactI18next);
  if (!i18next.isInitialized) {
    i18next.init(i18nextOptions as any);
  }
  return i18next;
}
