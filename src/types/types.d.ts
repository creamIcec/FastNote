interface Window {
  windowControl: {
    minimize: () => void;
    maximize: () => void;
    hide: () => void;
  };

  windowEvents: {
    onWindowShow: (...callbacks: (() => void)[]) => void;
  };

  noteService: {
    saveNote: (name: string, content: string) => Promise<boolean>;
    readNote: (name: string) => Promise<string> | Promise<undefined>;
    saveExternal: (name: string) => Promise<string> | Promise<undefined>;
    createNote: (name: string) => Promise<string> | Promise<boolean>;
    renameNote: (name: string, newName: string) => Promise<boolean>;
    deleteNote: (name: string) => Promise<boolean>;
    readLastNameInList: () => Promise<string> | Promise<boolean>;
    readRecentTitle: () => Promise<string> | Promise<undefined>;
    saveRecentTitle: (name: string) => Promise<string> | Promise<undefined>;
    readNoteList: () => Promise<[]>;
  };

  notificationService: {
    scheduleNotification: (
      delay: number,
      name: string,
      content: string
    ) => Promise<boolean>;
  };

  shortcutService: {
    modifyGlobalBringUpWindowShortcut: (shortcut?: string[]) => boolean;
  };

  externalResourceService: {
    openInBrowser: (link: LinkTarget) => void;
  };

  i18nService: {
    getInitialTranslations: () => any;
    getAvailableLanguages: () => any;
    changeLanguage: (lang: string) => any;
    getCurrentLanguage: () => Promise<string>;
  };
}
