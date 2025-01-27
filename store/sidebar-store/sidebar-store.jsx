import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useSidebarStore = create(
  persist(
    (set, get) => ({
      activeWorkspace: null,
      workspaces: [],
      teamWorkspaces: [],
      workspaceCollections: [],
      setWorkspaces: (workspaces) => set({ workspaces }),
      updateActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
      addWorkspace: (workspace) =>
        set((state) => ({
          workspaces: Array.isArray(state.workspaces)
            ? [...state.workspaces, workspace]
            : [workspace], // Si no es un array, lo inicializamos con el nuevo workspace
        })),

      setWorkspaceCollecions: (workspaceCollections) => set({workspaceCollections}),
      isSidebarOpen: true, // Estado inicial de la sidebar
      openSidebar: () => set({ isSidebarOpen: true }), // Función para abrir la sidebar
      closeSidebar: () => set({ isSidebarOpen: false }), // Función para cerrar la sidebar
    }),
    {
      name: "sidebar-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
