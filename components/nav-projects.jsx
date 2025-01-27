"use client"

import { Folder } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";

export function NavProjects({
  isCollapsed
}) {
  const activeWorkspace = useSidebarStore((state) => state.activeWorkspace);

  if (!activeWorkspace?.collections?.length) {
    return null;
  }

  return (
    <SidebarGroup>
      {!isCollapsed && <SidebarGroupLabel>Collections</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {activeWorkspace.collections?.map((collection) => (
            <SidebarMenuItem key={collection.id}>
              <SidebarMenuButton asChild>
                <a href={`/workspaces/${activeWorkspace.id}/collections/${collection.id}`}>
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Folder className="size-4" />
                  </div>
                  {!isCollapsed && collection.name}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
