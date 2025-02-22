import i18next from "i18next";
import i18nextBackend from "i18next-node-fs-backend";

const config = {
  fallbackLng: "en",
  languages: ["en", "zh"],
  languageMap: {
    en: "English",
    zh: "简体中文",
  },
};

const i18nextOptions = {
  backend: {
    loadPath: "./src/locales/{{lng}}/{{ns}}.json",
    addPath: "./src/locales/{{lng}}/{{ns}}.missing.json",
    jsonIndent: 2,
  },

  interpolation: {
    escapeValue: false,
  },

  saveMissing: true,
  fallbackLng: config.fallbackLng,
  whitelist: config.languages,
  debug: true,
  react: {
    wait: false,
  },
};

export async function initI18n() {
  i18next.use(i18nextBackend);

  if (!i18next.isInitialized) {
    await i18next.init(i18nextOptions as any);
  }
}

export { config as languageConfig, i18next };
