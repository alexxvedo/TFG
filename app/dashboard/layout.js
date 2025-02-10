"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { useThemeStore } from "@/store/theme-store/theme-store";

export default function DashboardLayout({ children }) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  return (
    <SidebarProvider>
      <div
        className={`flex flex-row min-w-screen min-h-screen justify-start ${
          isDarkMode ? "dark" : ""
        }`}
      >
        <AppSidebar />
        <SidebarTrigger />

        {children}
      </div>
    </SidebarProvider>
  );
}
