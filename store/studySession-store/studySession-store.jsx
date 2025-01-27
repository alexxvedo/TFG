import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useStudySessionStore = create(
  persist((set, get) => ({
    studySession: {},

    updateStudySession: (studySession) => {
      set((state) => ({ studySession: studySession }));
    },
  })),
  {
    name: "studySession-store",
    storage: createJSONStorage(() => studySessionStorage),
  }
);
