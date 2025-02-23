import { getCurrentLanguage, getLanguagesInfo } from "@/actions/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MdElevatedCard,
  MdIcon,
  MdIconButton,
  MdList,
  MdListItem,
  MdRadio,
} from "react-material-web";
import DialogAnimationWrapper from "./animator/DialogAnimationWrapper";
import styles from "./LanguageSettingWindow.module.css";
import WindowBlockComponentWrapper from "./WindowBlockComponentWrapper";
import { LanguageManager } from "@/utils/lang";

export default function LanguageSettingWindow({
  setIsLanguageSettingWindowOpen,
  applyLanguageSetting,
}: {
  setIsLanguageSettingWindowOpen: (isOpen: boolean) => void;
  applyLanguageSetting: (lang: string) => void;
}) {
  const handleApplyLanguage = (code: string) => {
    applyLanguageSetting(code);
    setCurrentLanguage(code);
  };

  const handleOnQuit = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.key === "Escape") {
        setIsLanguageSettingWindowOpen(false);
      }
    },
    [setIsLanguageSettingWindowOpen]
  );

  const [availableLanguages, setAvailableLanguages] = useState<any | null>();
  const [currentLanguage, setCurrentLanguage] = useState(
    LanguageManager.getInstance().getFallbackLang()
  );

  useEffect(() => {
    document.addEventListener("keydown", handleOnQuit);
    return () => document.removeEventListener("keydown", handleOnQuit);
  }, []);

  useEffect(() => {
    const availableLanguages = getLanguagesInfo();
    availableLanguages.then((value: any) => {
      setAvailableLanguages(value.languageMap);
    });
  }, []);

  useEffect(() => {
    const fetchLanguage = async () => {
      const lang = await getCurrentLanguage();
      setCurrentLanguage(lang);
    };
    fetchLanguage();
  }, [currentLanguage]);

  const { t, i18n } = useTranslation();

  return (
    <WindowBlockComponentWrapper>
      <DialogAnimationWrapper>
        <MdElevatedCard className={styles.dialog}>
          <div className={styles.toolbar}>
            <h3 style={{ paddingLeft: "12px", paddingTop: "0" }}>
              {t("set_language")}
            </h3>
            <MdIconButton onClick={() => setIsLanguageSettingWindowOpen(false)}>
              <MdIcon>close</MdIcon>
            </MdIconButton>
          </div>
          <MdList className={styles["languages-list"]}>
            {availableLanguages &&
              Object.entries(availableLanguages).map(([code, name]) => (
                <MdListItem key={code}>
                  <span>{name as string}</span>
                  <MdRadio
                    slot="start"
                    name="languages"
                    value={code}
                    checked={currentLanguage === code}
                    onChange={() => handleApplyLanguage(code)}
                  ></MdRadio>
                </MdListItem>
              ))}
          </MdList>
        </MdElevatedCard>
      </DialogAnimationWrapper>
    </WindowBlockComponentWrapper>
  );
}
