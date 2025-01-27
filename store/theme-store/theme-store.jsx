import { create } from "zustand";

export const useThemeStore = create((set) => ({
  isDarkMode: false,
  setIsDarkMode: (isDarkMode) => set({ isDarkMode }),
}));
