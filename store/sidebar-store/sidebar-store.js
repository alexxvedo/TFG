import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSidebarStore = create(
  persist(
    (set, get) => ({
      isCollapsed: false,
      workspaces: [],
      activeWorkspace: null,
      toggleCollapsed: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),
      setWorkspaces: (workspaces) => {
        const currentWorkspaces = get().workspaces;
        // Solo actualizar si los workspaces han cambiado
        if (JSON.stringify(workspaces) !== JSON.stringify(currentWorkspaces)) {
          set({ workspaces });
        }
      },
      clearWorkspaces: () => set({ workspaces: [], activeWorkspace: null }),
      addWorkspace: (workspace) => {
        const state = get();
        // Evitar duplicados
        if (!state.workspaces.some(w => w.id === workspace.id)) {
          set({
            workspaces: [...state.workspaces, workspace],
            activeWorkspace: state.activeWorkspace || workspace,
          });
        }
      },
      updateActiveWorkspace: (workspace) => {
        const state = get();
        // Solo actualizar si el workspace ha cambiado
        if (!state.activeWorkspace || state.activeWorkspace.id !== workspace.id) {
          set({ activeWorkspace: workspace });
        }
      },
      addCollectionToWorkspace: (workspaceId, collection) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId
              ? {
                  ...w,
                  collections: [...(w.collections || []), collection],
                }
              : w
          ),
          activeWorkspace:
            state.activeWorkspace?.id === workspaceId
              ? {
                  ...state.activeWorkspace,
                  collections: [
                    ...(state.activeWorkspace.collections || []),
                    collection,
                  ],
                }
              : state.activeWorkspace,
        })),
    }),
    {
      name: "sidebar-storage",
      version: 1,
      merge: (persistedState, currentState) => {
        return {
          ...currentState,
          ...persistedState,
          // Mantener el workspace activo del estado persistido si existe
          activeWorkspace: persistedState?.activeWorkspace || currentState.activeWorkspace
        };
      },
    }
  )
);
