import { DEFAULT_NOTE_TITLE } from "@/constants";
import { readRecentTitle } from "@/actions/api";

import { create } from "zustand";

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
      console.log("最近标题:", savedPervTitle);
      if (!savedPervTitle) {
        savedPervTitle = DEFAULT_NOTE_TITLE;
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
