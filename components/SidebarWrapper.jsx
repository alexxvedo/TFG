// components/SidebarWrapper.js
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { usePathname } from "next/navigation";

export default function SidebarWrapper() {
  const pathname = usePathname();
  const hideSidebar = pathname.includes("/editor") || pathname.includes("/ai");

  if (hideSidebar) return null;
  return <AppSidebar />;
}
