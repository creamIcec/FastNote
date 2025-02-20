import { Theme } from "@/utils/theme";

import { create } from "zustand";

const themes: Theme[] = ["system", "light", "dark"];

export interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  getNextTheme: () => Theme;
}

export const useThemeState = create<ThemeState>((set, get) => ({
  theme: "light",
  setTheme: (theme: Theme) =>
    set((prev) => ({
      ...prev,
      theme,
    })),
  getNextTheme: () => {
    return themes[(themes.indexOf(get().theme) + 1) % themes.length];
  },
}));
