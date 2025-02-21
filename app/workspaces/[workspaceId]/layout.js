// app/workspaces/[workspaceId]/layout.js

"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarWrapper from "@/components/SidebarWrapper";
import { useEffect } from "react";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";

export default function WorkspaceLayout({ children, params }) {
  const { workspaceId } = params;
  const workspaces = useSidebarStore((state) => state.workspaces);
  const updateActiveWorkspace = useSidebarStore(
    (state) => state.updateActiveWorkspace
  );

  useEffect(() => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      updateActiveWorkspace(workspace);
    }
  }, [workspaceId, workspaces, updateActiveWorkspace]);

  return (
    <SidebarProvider>
      <div className="flex w-full h-full">
        <SidebarWrapper />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
