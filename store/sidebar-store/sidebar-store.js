import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSidebarStore = create(
  persist(
    (set) => ({
      isCollapsed: false,
      workspaces: [],
      activeWorkspace: null,
      toggleCollapsed: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),
      setWorkspaces: (workspaces) => set({ workspaces }),
      addWorkspace: (workspace) =>
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
          activeWorkspace: state.activeWorkspace || workspace,
        })),
      updateActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
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
    }
  )
);
