import {
  DEFAULT_NOTE_TITLE,
  DEFAULT_NOTE_TITLE_TRANSLATION_KEY,
} from "@/constants";
import { readRecentTitle } from "@/actions/api";

import { create } from "zustand";
import i18next from "i18next";

export interface Content {
  content: string;
  setContent: (newContent: string) => void;
}

export interface Title {
  title: string | undefined;
  setTitle: (newTitle: string | undefined) => void;
  fetchAndSetPrevTitle: () => void;
}

export interface AttemptDelete {
  name: string | undefined;
  content: string | undefined;
  setName: (newName: string | undefined) => void;
  setContent: (newContent: string | undefined) => void;
}

export const useContent = create<Content>((set) => ({
  content: "",
  setContent: (newContent) =>
    set((prev) => ({
      ...prev,
      content: newContent,
    })),
}));

export const useAttemptDelete = create<AttemptDelete>((set) => ({
  name: undefined,
  content: undefined,
  setName: (newName) =>
    set((prev) => ({
      ...prev,
      name: newName,
    })),
  setContent: (newContent) =>
    set((prev) => ({
      ...prev,
      content: newContent,
    })),
}));

export const useTitle = create<Title>((set) => ({
  title: undefined,
  setTitle: (newTitle) =>
    set((prev) => ({
      ...prev,
      title: newTitle,
    })),
  fetchAndSetPrevTitle: async () => {
    try {
      let savedPervTitle = await readRecentTitle();
      console.log("Title of recently used note:", savedPervTitle);
      if (!savedPervTitle) {
        savedPervTitle = i18next.isInitialized
          ? i18next.t(DEFAULT_NOTE_TITLE_TRANSLATION_KEY)
          : DEFAULT_NOTE_TITLE;
      }
      set((prev) => ({
        ...prev,
        title: savedPervTitle,
      }));
    } catch (error) {
      console.error("Error fetching saved title:", error);
    }
  },
}));
