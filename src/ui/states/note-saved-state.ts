import { create } from "zustand";

export type NoteSavedStateEnum = "saved" | "pending" | "error";

export interface NoteSavedState {
  saveState: NoteSavedStateEnum;
  setIsSaved: (isTyping: NoteSavedStateEnum) => void;
}

export const useTypingState = create<NoteSavedState>((set) => ({
  saveState: "pending",
  setIsSaved: (isSaved: NoteSavedStateEnum) =>
    set((prev) => ({
      ...prev,
      saveState: isSaved,
    })),
}));
