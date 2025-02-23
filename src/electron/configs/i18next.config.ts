import i18next from "i18next";
import i18nextFsBackend from "i18next-fs-backend";
import { isDev } from "../environment-util.js";
import { app } from "electron";
import path from "path";

//from https://stackoverflow.com/questions/46072248/node-js-how-to-detect-user-language
export function getUserLocale() {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  const lang = locale.split("-")[0];
  return lang;
}

const config = {
  fallbackLang: "en",
  languages: ["en", "zh"],
  languageMap: {
    en: "English",
    zh: "简体中文",
  },
  namespace: "translation",
};

const i18nextOptions = {
  backend: {
    loadPath: isDev()
      ? "./src/electron/resources/locales/{{lng}}/{{ns}}.json"
      : path.join(
          app.getAppPath(),
          "/dist-electron/resources/locales/{{lng}}/{{ns}}.json"
        ),
    addPath: isDev()
      ? "./src/electron/resources/locales/{{lng}}/{{ns}}.missing.json"
      : path.join(
          app.getAppPath(),
          "/dist-electron/resources/locales/{{lng}}/{{ns}}.missing.json"
        ),
    jsonIndent: 2,
  },

  interpolation: {
    escapeValue: false,
  },
  saveMissing: true,
  fallbackLng: config.fallbackLang,
  whitelist: config.languages,
  react: {
    wait: false,
  },
};

export async function initI18n() {
  i18next.use(i18nextFsBackend);

  if (!i18next.isInitialized) {
    await i18next.init(i18nextOptions as any);
  }
}

export { config as languageConfig, i18next };
