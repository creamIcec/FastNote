import { create } from "zustand";
import { DEFAULT_NOTE_TITLE } from "../constants";

export interface Content {
  content: string;
  setContent: (newContent: string) => void;
}

export interface Title {
  title: string | undefined;
  setTitle: (newTitle: string) => void;
  fetchAndSetPrevTitle: () => void;
}

export const useContent = create<Content>((set, get) => ({
  content: "",
  setContent: (newContent: string) =>
    set((prev) => ({
      ...prev,
      content: newContent,
    })),
}));

export const useTitle = create<Title>((set, get) => ({
  title: undefined,
  setTitle: (newTitle: string) =>
    set((prev) => ({
      ...prev,
      title: newTitle,
    })),
  fetchAndSetPrevTitle: async () => {
    try {
      let savedPervTitle = await window.noteService.readRecentTitle();
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
