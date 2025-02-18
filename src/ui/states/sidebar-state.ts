import { create } from "zustand";

export interface SidebarState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useSidebarState = create<SidebarState>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) =>
    set((prev) => ({
      ...prev,
      isOpen,
    })),
}));
