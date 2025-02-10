"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useSidebarStore } from "@/store/sidebar-store/sidebar-store";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function WorkspaceLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
