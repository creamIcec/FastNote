import { getCurrentTranslations, getLanguagesInfo } from "@/actions/api";
import { prepareI18nClient } from "@/configs/i18next.config.client";

export class LanguageManager {
  private fallbackLang?: string;
  private namespace?: string;
  private static manager: LanguageManager = new LanguageManager();

  private constructor() {}

  private async initLang() {
    //初始化i18n客户端
    const initialTranslations = getCurrentTranslations();
    const languageInfo = getLanguagesInfo();

    Promise.all([initialTranslations, languageInfo]).then(([bundle, info]) => {
      const i18n = prepareI18nClient(info);
      i18n.addResourceBundle(info.currentLang, info.namespace, bundle);
    });

    return languageInfo;
  }

  public async initialize() {
    const langInfo = await this.initLang();
    this.fallbackLang = langInfo.fallbackLang;
    console.log(langInfo);
  }

  public static getInstance() {
    return this.manager;
  }

  public getNamespace(): string | undefined {
    return this.namespace;
  }

  public getFallbackLang(): string | undefined {
    return this.fallbackLang;
  }
}
