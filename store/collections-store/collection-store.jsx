import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const storage = typeof window !== 'undefined' 
  ? createJSONStorage(() => localStorage)
  : createJSONStorage(() => ({
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }));

export const useCollectionStore = create(
  persist(
    (set, get) => ({
      activeCollection: null,
      setActiveCollection: (collection) => {
        console.log('Setting active collection:', collection);
        set({ activeCollection: collection });
      },
      addFlashcard: (flashcard) =>
        set((state) => ({
          activeCollection: {
            ...state.activeCollection,
            flashcards: [
              ...(state.activeCollection?.flashcards || []),
              flashcard,
            ],
          },
        })),
      updateFlashcard: (flashcardId, updates) =>
        set((state) => ({
          activeCollection: {
            ...state.activeCollection,
            flashcards: state.activeCollection?.flashcards?.map((f) =>
              f.id === flashcardId ? { ...f, ...updates } : f
            ) || [],
          },
        })),
      removeFlashcard: (flashcardId) =>
        set((state) => ({
          activeCollection: {
            ...state.activeCollection,
            flashcards: state.activeCollection?.flashcards?.filter(
              (f) => f.id !== flashcardId
            ) || [],
          },
        })),
    }),
    {
      name: "collection-storage",
      storage,
      onRehydrateStorage: () => (state) => {
        console.log('Store rehydrated with state:', state);
      },
    }
  )
);
