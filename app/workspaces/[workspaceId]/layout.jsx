"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function WorkspaceLayout({ children }) {
  const params = useParams();
  const { workspaceId } = params;
  const workspaces = useSidebarStore((state) => state.workspaces);
  const updateActiveWorkspace = useSidebarStore(
    (state) => state.updateActiveWorkspace
  );

  useEffect(() => {
    if (!workspaceId || !workspaces?.length) return;

    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      updateActiveWorkspace(workspace);
    }
  }, [workspaceId, workspaces, updateActiveWorkspace]);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto ">{children}</main>
      </div>
    </SidebarProvider>
  );
}
